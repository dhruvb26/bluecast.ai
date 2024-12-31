"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getOrganizationInvitations,
  revokeInvitation,
  deleteMemberFromWorkspace,
  getOrganizationMembers,
  updateUserMemberRole,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspace";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InviteMemberDialog } from "@/app/(private)/settings/_components/invite-member-dialog";
import { useRouter } from "next/navigation";

const WorkspaceSettings = ({ params }: { params: { workspaceId: string } }) => {
  const { organization } = useOrganization();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (params.workspaceId) {
        const [invitationsResponse, membersResponse] = await Promise.all([
          getOrganizationInvitations(params.workspaceId),
          getOrganizationMembers(params.workspaceId),
        ]);
        setInvitations(invitationsResponse);
        setMembers(membersResponse);
      }
    };
    fetchData();
  }, [params.workspaceId]);

  useEffect(() => {
    if (organization?.name) {
      setWorkspaceName(organization.name);
    }
  }, [organization?.name]);

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!organization?.id) return;

    const response = await revokeInvitation(organization.id, invitationId);
    if (response.success) {
      toast.success("Invitation revoked successfully.");
      // Refresh invitations list
      const updatedInvitations = await getOrganizationInvitations(
        organization.id
      );
      setInvitations(updatedInvitations);
    } else {
      toast.error(response.error || "Failed to revoke invitation.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization?.id) return;

    const response = await deleteMemberFromWorkspace(organization.id, userId);
    if (response.success) {
      toast.success("Member removed successfully.");
      // Refresh members list
      const updatedMembers = await getOrganizationMembers(organization.id);
      setMembers(updatedMembers);
    } else {
      toast.error("Failed to remove member.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!organization?.id) return;

    const response = await updateUserMemberRole(
      organization.id,
      userId,
      newRole
    );
    if (response.success) {
      toast.success("Member role updated successfully.");
      // Refresh members list
      const updatedMembers = await getOrganizationMembers(organization.id);
      setMembers(updatedMembers);
    } else {
      toast.error("Failed to update member role.");
    }
  };

  const handleUpdateWorkspace = async () => {
    if (!organization?.id) return;

    const response = await updateWorkspace(organization.id, workspaceName);
    if (response.success) {
      toast.success("Workspace name updated successfully.");
      setIsEditing(false);
    } else {
      toast.error(response.error || "Failed to update workspace name");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!organization?.id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this workspace? This action cannot be undone."
      )
    ) {
      const response = await deleteWorkspace(organization.id);
      if (response.success) {
        toast.success("Workspace deleted successfully.");
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to delete workspace");
      }
    }
  };

  return (
    <main className="p-8">
      <div className="space-y-12">
        <div className="text-left">
          <Link
            href="/settings/workspace"
            className="inline-flex transition-all items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4 stroke-2" />
            Back to Workspaces
          </Link>
          <div className="px-7 pt-4"></div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Workspace Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace settings here.
          </p>
        </div>

        <section className="flex space-x-4">
          <div className="w-full">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your workspace details here.
            </p>
          </div>
          <div className="w-full space-y-4">
            <div className="flex flex-row items-center space-x-2">
              <Input
                placeholder="Workspace Name"
                disabled={!isEditing}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
              {isEditing ? (
                <Button onClick={handleUpdateWorkspace}>Save</Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              )}
              <Button variant="outline" onClick={handleDeleteWorkspace}>
                Delete
              </Button>
            </div>
          </div>
        </section>
        <div className="w-full">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Workspace Members
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your workspace members here.
              </p>
            </div>
            <InviteMemberDialog
              organizationId={organization?.id || ""}
              onInviteSuccess={() => {
                if (organization?.id) {
                  getOrganizationInvitations(organization.id).then(
                    setInvitations
                  );
                }
              }}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="hover:bg-background">
                  <TableCell>{member.emailAddress}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="org:member">Member</SelectItem>
                        <SelectItem value="org:admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col w-full">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Pending Invitations
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your pending invitations here.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id} className="hover:bg-background">
                  <TableCell>{invitation.emailAddress}</TableCell>
                  <TableCell>
                    <Select disabled value={invitation.status}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          {invitation.status.charAt(0).toUpperCase() +
                            invitation.status.slice(1)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={invitation.status}>
                          {invitation.status}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground text-sm"
                  >
                    No pending invitations.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
};

export default WorkspaceSettings;
