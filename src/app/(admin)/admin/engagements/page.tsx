import { db } from "@/lib/db/client";
import { engagements, profiles, engagementAssignments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEngagementsPage() {
  const [allEngagements, allProfiles, allAssignments] = await Promise.all([
    db.select().from(engagements).orderBy(desc(engagements.createdAt)),
    db.select().from(profiles).where(eq(profiles.active, true)),
    db.select().from(engagementAssignments),
  ]);

  const assignmentsByEng = allAssignments.reduce((acc, a) => {
    if (!acc[a.engagementId]) acc[a.engagementId] = [];
    acc[a.engagementId].push(a);
    return acc;
  }, {} as Record<string, typeof allAssignments>);

  const profileMap = Object.fromEntries(allProfiles.map((p) => [p.id, p]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Briefcase size={18} className="text-primary" /> Engagement Assignments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage team assignments across all engagements</p>
      </div>

      <div className="space-y-4">
        {allEngagements.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No engagements yet.
            </CardContent>
          </Card>
        ) : allEngagements.map((eng) => {
          const assignments = assignmentsByEng[eng.id] ?? [];
          return (
            <Card key={eng.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{eng.clientName}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${eng.status === "active" ? "border-[#00D4AA]/30 text-[#00D4AA]" : "border-border text-muted-foreground"}`}>
                        {eng.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">G{eng.currentGate} · {eng.currentPhase}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{eng.vertical}</span>
                      <span>·</span>
                      <span>${(eng.contractValue / 1000).toFixed(0)}k</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Users size={12} className="text-muted-foreground" />
                    {assignments.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/60">No assignments</span>
                    ) : assignments.map((a) => {
                      const profile = profileMap[a.profileId];
                      return profile ? (
                        <div key={a.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px]">
                          <span className="text-foreground">{profile.fullName.split(" ")[0]}</span>
                          <span className="text-muted-foreground capitalize">· {a.role}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
