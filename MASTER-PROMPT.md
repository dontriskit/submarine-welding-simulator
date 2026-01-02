# SUBMARINE WELDING SIMULATOR - MASTER PROMPT

## Project Overview
Building a Three.js underwater welding teleoperator training simulator with:
- Realistic wet welding mechanics
- Simulation-style physics (heavy inertia, realistic drag)
- Multi-camera dashboard (4 views: welding, external, forward, minimap)
- Local multiplayer (keyboard split OR keyboard + RADIOMASTER POCKET joystick)
- Career progression + free practice modes
- Real-time weld quality scoring (S/A/B/C/D/F ratings)

## Your Mission
You are one of 3 parallel agents building this simulator:
- **CODER-A**: Core systems, input, state, physics
- **CODER-B**: Entities, UI, cameras, effects
- **SUPERVISOR**: PR reviews, integration, human interface

## Startup Sequence

### 1. IDENTIFY YOUR ROLE
Read your role file:
```bash
cat ROLES/terminal-{1,2,3}-{coder-a,coder-b,supervisor}.md
```

### 2. CHECK YOUR TASK QUEUE
```bash
cat TASK-QUEUE/queue-{coder-a,coder-b,supervisor}.md
```

### 3. VERIFY BRANCH
```bash
git branch --show-current
# CODER-A: dev/coder-a
# CODER-B: dev/coder-b
# SUPERVISOR: main
```

### 4. PULL LATEST
```bash
git pull origin $(git branch --show-current)
```

### 5. EXECUTE FIRST TASK IN QUEUE
Read the task, implement it, commit, update status.

### 6. MARK TASK COMPLETE
Edit your queue file: change `[ ]` to `[x]`

### 7. LOOP
Continue with next task until queue empty or blocked.

---

## Communication Protocol

### Task Completion Signal
After completing a task, append to `TASK-QUEUE/completed.log`:
```
[TIMESTAMP] [ROLE] TASK-ID: description
```

### Blocking Signal
If blocked, append to `TASK-QUEUE/blocked.log`:
```
[TIMESTAMP] [ROLE] BLOCKED: reason
```

### Request Human
If need human input, append to `TASK-QUEUE/human-request.log`:
```
[TIMESTAMP] [ROLE] REQUEST: question
```

---

## File Reference

| File | Purpose |
|------|---------|
| `MASTER-PROMPT.md` | This file - project overview |
| `CORE-PLAN.md` | Full tech tree and task registry |
| `COLLABORATION-RULES.md` | Branch and commit rules |
| `ROLES/terminal-*.md` | Role-specific instructions |
| `TASK-QUEUE/queue-*.md` | Per-agent task queues |
| `TASK-QUEUE/*.log` | Communication logs |
| `src/types/interfaces.ts` | Shared interface contracts |

---

## Quick Start Commands

### CODER-A
```bash
cd /home/mhm/Documents/submarine-welding-simulator
git checkout dev/coder-a && git pull origin dev/coder-a
cat TASK-QUEUE/queue-coder-a.md
# Execute first [ ] task
```

### CODER-B
```bash
cd /home/mhm/Documents/submarine-welding-simulator
git checkout dev/coder-b && git pull origin dev/coder-b
cat TASK-QUEUE/queue-coder-b.md
# Execute first [ ] task
```

### SUPERVISOR
```bash
cd /home/mhm/Documents/submarine-welding-simulator
git checkout main && git pull origin main
cat TASK-QUEUE/queue-supervisor.md
# Monitor and merge PRs
```

---

## Success Criteria
- All tasks complete
- All merge points passed
- Game runs: `npm run dev`
- All features work as specified in CORE-PLAN.md
