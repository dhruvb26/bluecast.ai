"use server";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { drafts } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getQueue } from "@/server/bull/queue";
import { saveJobId, getJobId, deleteJobId } from "@/server/bull/redis";
import { getUser } from "@/actions/user";
import { getDraft, updateDraftField } from "@/actions/draft";
import { type Queue } from "bullmq";
import { type JobsOptions } from "bullmq";
import { DateTime } from "luxon";

interface ScheduleData {
  postId: string;
  scheduledTime: string;
  timezone: string;
  name: string;
}

interface JobData {
  userId: string;
  postId: string;
}

export async function POST(req: Request) {
  try {
    const queue = await getQueue();
    if (!queue) {
      return NextResponse.json(
        { error: "Queue not initialized" },
        { status: 500 }
      );
    }

    const { postId, scheduledTime, timezone, name }: ScheduleData =
      await req.json();
    const user = await getUser();
    const userId = user.id;
    const scheduledDate = DateTime.fromISO(scheduledTime, { zone: timezone });

    const getDraftResult = await getDraft(postId);
    if (!getDraftResult.success || !getDraftResult.data.content) {
      return NextResponse.json(
        { error: "Draft content not found" },
        { status: 400 }
      );
    }

    const now = DateTime.now().setZone(timezone);
    if (scheduledDate < now) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const existingJobId = await getJobId(userId, postId);
    if (existingJobId) {
      await handleExistingJob(queue, existingJobId, userId, postId);
    }

    await ensureDraftExists(
      db,
      userId,
      postId,
      name,
      getDraftResult.data.content
    );

    const jobData: JobData = { userId, postId };
    const jobOptions = prepareJobOptions(scheduledDate);
    const job = await queue.add("post", jobData, jobOptions);

    if (!job.id) {
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    await saveJobId(userId, postId, job.id);
    await updateThisDraft(
      db,
      postId,
      name,
      scheduledDate.toISO() as string,
      timezone
    );

    return NextResponse.json({
      success: true,
      message: existingJobId
        ? "Post rescheduled successfully!"
        : "Post scheduled successfully!",
      jobId: job.id,
      scheduledFor: scheduledDate.toISO(),
      timezone: timezone,
    });
  } catch (error) {
    console.error("Error scheduling post:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while scheduling the post",
      },
      { status: 500 }
    );
  }
}

function prepareJobOptions(scheduledDate: DateTime): JobsOptions {
  const now = DateTime.now().toUTC();
  const scheduledUTC = scheduledDate.toUTC();
  const delay = scheduledUTC.toMillis() - now.toMillis();

  if (delay < 0) {
    throw new Error("Scheduled time must be in the future");
  }

  return {
    removeOnComplete: true,
    removeOnFail: true,
    delay: delay,
  };
}

async function updateThisDraft(
  db: any,
  postId: string,
  name: string,
  scheduledTime: string,
  timezone: string
) {
  await db
    .update(drafts)
    .set({
      status: "scheduled",
      name: name,
      scheduledFor: scheduledTime ? new Date(scheduledTime) : null,
      timeZone: timezone,
      updatedAt: new Date(),
    })
    .where(eq(drafts.id, postId));
}

async function handleExistingJob(
  queue: Queue,
  existingJobId: string,
  userId: string,
  postId: string
) {
  const existingJob = await queue.getJob(existingJobId);
  if (existingJob) {
    await queue.remove(existingJobId);
  }
  await deleteJobId(userId, postId);
}

async function ensureDraftExists(
  db: any,
  userId: string,
  postId: string,
  name: string,
  content: string
) {
  const existingDraft = await db
    .select()
    .from(drafts)
    .where(and(eq(drafts.id, postId), eq(drafts.userId, userId)))
    .limit(1);

  if (existingDraft.length === 0) {
    await db.insert(drafts).values({
      id: postId,
      userId: userId,
      name: name,
      content: content,
      status: "saved",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function DELETE(req: Request) {
  const { postId } = (await req.json()) as any;
  const user = await getUser();
  const userId = user.id;

  if (!userId || !postId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const queue = await getQueue();
    if (!queue) {
      return NextResponse.json(
        { error: "Queue not initialized" },
        { status: 500 }
      );
    }

    const jobId = await getJobId(userId, postId);
    if (jobId) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
      }
      await deleteJobId(userId, postId);
    }

    const result = await updateDraftField(postId, "status", "saved");
    await db
      .update(drafts)
      .set({ scheduledFor: null, timeZone: null })
      .where(eq(drafts.id, postId));

    if (result.success) {
      return NextResponse.json({ message: "Post resaved as saved" });
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in DELETE method:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      { status: 500 }
    );
  }
}
