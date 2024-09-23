import React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import Link from "next/link";
import { Sparkle, Users, Book } from "@phosphor-icons/react";
import { ArrowUpRight } from "lucide-react";

const CTACard = () => {
  return (
    <Card className="mt-8">
      <CardContent className="mt-6">
        <ul className="space-y-4">
          <li className="flex items-start">
            <Sparkle className="text-primary mr-1" size={22} />
            <div>
              <h3 className="font-semibold group">
                <Link href="/create/ideas" className="flex items-center group">
                  Generated Ideas
                  <ArrowUpRight
                    size={20}
                    className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                  />
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                Explore AI-generated content ideas tailored to your niche
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <Book className="text-primary mr-1" size={22} />
            <div>
              <h3 className="font-semibold group">
                <Link href="/create/posts" className="flex items-center group">
                  Use Our Templates
                  <ArrowUpRight
                    size={20}
                    className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                  />
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                Start with pre-designed templates for various content types
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <Users className="text-primary mr-1" size={22} />
            <div>
              <h3 className="font-semibold group">
                <Link
                  href="/create/inspiration"
                  className="flex items-center group"
                >
                  Inspiration
                  <ArrowUpRight
                    size={20}
                    className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                  />
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                Get inspired from a list of curated content creators on
                LinkedIn.
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CTACard;
