from pydantic import BaseModel
from typing import List, Optional, Dict


class ProfilerOutput(BaseModel):
    business_type: str
    tech_required: bool
    prioritized_branches: List[str]
    banned_branches: List[str]
    reasoning: str


class TeamMember(BaseModel):
    name: str
    role: str                    # e.g. "Co-Founder", "Developer", "Marketing Lead"
    skills: List[str]            # e.g. ["Python", "ML"] or ["Sales", "Negotiation"]


class BranchRoadmap(BaseModel):
    branch:   str
    status:   str                   # "success" | "failed"
    tasks:    Optional[List[Dict]]  # [{title, description, timeline, priority}]
    summary:  Optional[str]
    db_id:    Optional[str] = None  # roadmap_branches.id — for frontend DB sync


class EnrichedTask(BaseModel):
    task_id: str
    branch: str
    title: str
    description: Optional[str] = None
    timeline: Optional[str] = None
    priority: Optional[str] = None
    # Module 3 fields
    assigned_to: Optional[str] = None       # team member name
    assignee_role: Optional[str] = None     # their role
    estimated_hours: Optional[int] = None
    complexity: Optional[str] = None
    cost_impact: Optional[str] = None


class SyncedTask(BaseModel):
    task_id:         str
    branch:          str
    title:           str
    description:     Optional[str] = None
    timeline:        Optional[str] = None
    priority:        Optional[str] = None
    assigned_to:     Optional[str] = None
    assignee_role:   Optional[str] = None
    estimated_hours: Optional[int] = None
    complexity:      Optional[str] = None
    cost_impact:     Optional[str] = None
    db_id:           Optional[str] = None   # roadmap_tasks.id — for frontend DB sync
    # Module 4 fields
    status:          str       = "Ready"    # "Ready" | "Blocked"
    blocked_by:      List[str] = []
    unblocks:        List[str] = []


class RoadmapPipelineState(BaseModel):
    session_id: str
    status: str
    startup_name: str
    profiler_output: ProfilerOutput
    branch_roadmaps: List[BranchRoadmap]
    synced_tasks: List[SyncedTask] = []
