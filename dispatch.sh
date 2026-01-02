#!/bin/bash
# DISPATCH.SH - Control all 3 Claude Code terminals from one CLI
# Usage: ./dispatch.sh <command> [args]

PROJECT_DIR="/home/mhm/Documents/submarine-welding-simulator"
QUEUE_DIR="$PROJECT_DIR/TASK-QUEUE"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Timestamp
ts() {
    date "+%Y-%m-%d %H:%M"
}

# Agent prompts - these assume agent knows NOTHING about the project
PROMPT_CODER_A='You are CODER-A in a parallel development team.

FIRST, read these files IN ORDER to understand the project:
1. @COLLABORATION-RULES.md - Your branch rules, file ownership, commit protocol
2. @ROLES/terminal-1-coder-a.md - Your specific role and responsibilities
3. @TASK-QUEUE/queue-coder-a.md - Your task queue
4. @src/types/interfaces.ts - Shared interface contracts you must implement

THEN:
1. Checkout branch: git checkout dev/coder-a
2. Pull latest: git pull origin dev/coder-a
3. Find first task marked [ ] in your queue
4. Implement it following COLLABORATION-RULES.md
5. Commit with format: [CODER-A] <task-id>: <description>
6. Mark task [x] in queue file
7. Push: git push origin dev/coder-a
8. Continue to next task

You own: src/core/*, src/input/*, src/state/*, src/physics/*, src/systems/*, src/training/*, src/multiplayer/*, src/App.ts
You must NEVER edit files owned by CODER-B.'

PROMPT_CODER_B='You are CODER-B in a parallel development team.

FIRST, read these files IN ORDER to understand the project:
1. @COLLABORATION-RULES.md - Your branch rules, file ownership, commit protocol
2. @ROLES/terminal-2-coder-b.md - Your specific role and responsibilities
3. @TASK-QUEUE/queue-coder-b.md - Your task queue
4. @src/types/interfaces.ts - Shared interface contracts you must implement

THEN:
1. Checkout branch: git checkout dev/coder-b
2. Pull latest: git pull origin dev/coder-b
3. Find first task marked [ ] in your queue
4. Implement it following COLLABORATION-RULES.md
5. Commit with format: [CODER-B] <task-id>: <description>
6. Mark task [x] in queue file
7. Push: git push origin dev/coder-b
8. Continue to next task

You own: src/entities/*, src/cameras/*, src/ui/*, src/effects/*, src/environment/*, src/scenarios/*, src/missions/*, src/shaders/*, public/*
You must NEVER edit files owned by CODER-A.'

PROMPT_SUPERVISOR='You are SUPERVISOR in a parallel development team.

FIRST, read these files IN ORDER to understand the project:
1. @COLLABORATION-RULES.md - Branch strategy, merge rules, conflict resolution
2. @ROLES/terminal-3-supervisor.md - Your specific role and responsibilities
3. @CORE-PLAN-SUPERVISION.md - PR review checklists for each merge point
4. @TASK-QUEUE/queue-supervisor.md - Your task queue
5. @CORE-PLAN.md - Full project tech tree and progress

THEN:
1. Stay on branch: main
2. Monitor TASK-QUEUE/*.log files for blockers and requests
3. When both coders complete a phase, review their PRs
4. ALWAYS merge CODER-A first, then CODER-B
5. Run integration tests after each merge
6. Update progress in CORE-PLAN.md and CORE-PLAN-SUPERVISION.md

You control merges to main. You never code - only review, merge, and coordinate.'

case "$1" in
    # ============================================================
    # LAUNCH COMMANDS
    # ============================================================

    start-all)
        echo -e "${GREEN}=== MULTI-TERMINAL LAUNCH ===${NC}"
        echo ""
        echo "Open 3 terminal windows and run one command in each:"
        echo ""
        echo -e "${CYAN}━━━ Terminal 1 (CODER-A) ━━━${NC}"
        echo "cd $PROJECT_DIR"
        echo 'claude "'"$PROMPT_CODER_A"'"'
        echo ""
        echo -e "${CYAN}━━━ Terminal 2 (CODER-B) ━━━${NC}"
        echo "cd $PROJECT_DIR"
        echo 'claude "'"$PROMPT_CODER_B"'"'
        echo ""
        echo -e "${CYAN}━━━ Terminal 3 (SUPERVISOR) ━━━${NC}"
        echo "cd $PROJECT_DIR"
        echo 'claude "'"$PROMPT_SUPERVISOR"'"'
        echo ""
        echo -e "${YELLOW}TIP: Use ./dispatch.sh status to monitor progress${NC}"
        ;;

    start-a)
        echo -e "${CYAN}Launching CODER-A...${NC}"
        cd "$PROJECT_DIR"
        claude "$PROMPT_CODER_A"
        ;;

    start-b)
        echo -e "${CYAN}Launching CODER-B...${NC}"
        cd "$PROJECT_DIR"
        claude "$PROMPT_CODER_B"
        ;;

    start-super)
        echo -e "${CYAN}Launching SUPERVISOR...${NC}"
        cd "$PROJECT_DIR"
        claude "$PROMPT_SUPERVISOR"
        ;;

    # Quick single-task prompts (agent continues existing context)
    task-a)
        TASK="$2"
        if [ -z "$TASK" ]; then
            echo "Usage: $0 task-a \"task description\""
            exit 1
        fi
        cd "$PROJECT_DIR"
        claude "You are CODER-A. Read @COLLABORATION-RULES.md for your file ownership rules. Task: $TASK. Commit as [CODER-A] when done."
        ;;

    task-b)
        TASK="$2"
        if [ -z "$TASK" ]; then
            echo "Usage: $0 task-b \"task description\""
            exit 1
        fi
        cd "$PROJECT_DIR"
        claude "You are CODER-B. Read @COLLABORATION-RULES.md for your file ownership rules. Task: $TASK. Commit as [CODER-B] when done."
        ;;

    task-super)
        TASK="$2"
        if [ -z "$TASK" ]; then
            echo "Usage: $0 task-super \"task description\""
            exit 1
        fi
        cd "$PROJECT_DIR"
        claude "You are SUPERVISOR. Read @COLLABORATION-RULES.md and @CORE-PLAN-SUPERVISION.md. Task: $TASK"
        ;;

    # ============================================================
    # CONTINUE COMMANDS (for agents that lost context)
    # ============================================================

    continue-a)
        cd "$PROJECT_DIR"
        claude 'You are CODER-A resuming work.

Read @COLLABORATION-RULES.md to remember your rules.
Read @TASK-QUEUE/queue-coder-a.md to find your next task.

Your branch: dev/coder-a
Your files: src/core/*, src/input/*, src/state/*, src/physics/*, src/systems/*, src/training/*, src/multiplayer/*

Continue with the first [ ] task in your queue.'
        ;;

    continue-b)
        cd "$PROJECT_DIR"
        claude 'You are CODER-B resuming work.

Read @COLLABORATION-RULES.md to remember your rules.
Read @TASK-QUEUE/queue-coder-b.md to find your next task.

Your branch: dev/coder-b
Your files: src/entities/*, src/cameras/*, src/ui/*, src/effects/*, src/environment/*, src/scenarios/*, src/missions/*, public/*

Continue with the first [ ] task in your queue.'
        ;;

    continue-super)
        cd "$PROJECT_DIR"
        claude 'You are SUPERVISOR resuming work.

Read @COLLABORATION-RULES.md and @CORE-PLAN-SUPERVISION.md to remember your rules.
Read @TASK-QUEUE/queue-supervisor.md for your tasks.
Check @TASK-QUEUE/blocked.log and @TASK-QUEUE/human-request.log for pending issues.

Your branch: main
Your job: Review PRs, merge (A first then B), run tests, coordinate.'
        ;;

    # ============================================================
    # STATUS COMMANDS
    # ============================================================

    status)
        echo -e "${GREEN}=== PROJECT STATUS ===${NC}"
        echo ""

        echo -e "${CYAN}CODER-A Progress:${NC}"
        DONE_A=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        TODO_A=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_A | Remaining: $TODO_A"
        echo "  Next task: $(grep -m1 "\[ \]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null | head -1 || echo "(none)")"

        echo ""
        echo -e "${CYAN}CODER-B Progress:${NC}"
        DONE_B=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        TODO_B=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_B | Remaining: $TODO_B"
        echo "  Next task: $(grep -m1 "\[ \]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null | head -1 || echo "(none)")"

        echo ""
        echo -e "${CYAN}SUPERVISOR Progress:${NC}"
        DONE_S=$(grep -c "\[x\]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        TODO_S=$(grep -c "\[ \]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_S | Remaining: $TODO_S"

        echo ""
        echo -e "${YELLOW}Recent Completions:${NC}"
        tail -5 "$QUEUE_DIR/completed.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"

        echo ""
        echo -e "${RED}Active Blockers:${NC}"
        tail -5 "$QUEUE_DIR/blocked.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"

        echo ""
        echo -e "${YELLOW}Pending Human Requests:${NC}"
        tail -5 "$QUEUE_DIR/human-request.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"
        ;;

    watch)
        echo -e "${GREEN}Watching for updates... (Ctrl+C to stop)${NC}"
        watch -n 5 "$0 status"
        ;;

    # ============================================================
    # QUEUE MANAGEMENT
    # ============================================================

    add-task)
        ROLE="$2"
        TASK="$3"
        if [ -z "$ROLE" ] || [ -z "$TASK" ]; then
            echo "Usage: $0 add-task <a|b|super> \"task description\""
            exit 1
        fi

        case "$ROLE" in
            a) FILE="$QUEUE_DIR/queue-coder-a.md" ;;
            b) FILE="$QUEUE_DIR/queue-coder-b.md" ;;
            super) FILE="$QUEUE_DIR/queue-supervisor.md" ;;
            *) echo "Invalid role. Use: a, b, or super"; exit 1 ;;
        esac

        echo "" >> "$FILE"
        echo "- [ ] **HUMAN-ADDED**: $TASK" >> "$FILE"
        echo -e "${GREEN}Task added to $ROLE queue${NC}"
        ;;

    unblock)
        ROLE="$2"
        MSG="$3"
        if [ -z "$ROLE" ]; then
            echo "Usage: $0 unblock <a|b|super> [message]"
            exit 1
        fi
        echo "[$(ts)] [HUMAN] UNBLOCKED $ROLE: ${MSG:-proceed}" >> "$QUEUE_DIR/blocked.log"
        echo -e "${GREEN}Unblock signal sent for $ROLE${NC}"
        ;;

    respond)
        MSG="$2"
        if [ -z "$MSG" ]; then
            echo "Usage: $0 respond \"response message\""
            exit 1
        fi
        echo "[$(ts)] [HUMAN] RESPONSE: $MSG" >> "$QUEUE_DIR/human-request.log"
        echo -e "${GREEN}Response logged${NC}"
        ;;

    # ============================================================
    # GIT COMMANDS
    # ============================================================

    sync)
        echo -e "${GREEN}Syncing all branches...${NC}"
        cd "$PROJECT_DIR"
        git fetch origin

        CURRENT=$(git branch --show-current)

        git checkout main && git pull origin main
        git checkout dev/coder-a && git pull origin dev/coder-a
        git checkout dev/coder-b && git pull origin dev/coder-b

        git checkout "$CURRENT"
        echo -e "${GREEN}All branches synced. Back on: $CURRENT${NC}"
        ;;

    merge-a)
        echo -e "${YELLOW}Merging CODER-A to main...${NC}"
        cd "$PROJECT_DIR"
        git checkout main
        git pull origin main
        git pull origin dev/coder-a
        git merge --no-ff origin/dev/coder-a -m "MERGE: CODER-A tasks - $(date +%Y-%m-%d)"
        git push origin main
        echo "[$(ts)] [SUPERVISOR] Merged CODER-A to main" >> "$QUEUE_DIR/completed.log"
        echo -e "${GREEN}CODER-A merged to main${NC}"
        ;;

    merge-b)
        echo -e "${YELLOW}Merging CODER-B to main...${NC}"
        cd "$PROJECT_DIR"
        git checkout main
        git pull origin main
        git pull origin dev/coder-b
        git merge --no-ff origin/dev/coder-b -m "MERGE: CODER-B tasks - $(date +%Y-%m-%d)"
        git push origin main
        echo "[$(ts)] [SUPERVISOR] Merged CODER-B to main" >> "$QUEUE_DIR/completed.log"
        echo -e "${GREEN}CODER-B merged to main${NC}"
        ;;

    merge-both)
        echo -e "${YELLOW}Merging both coders (A first per COLLABORATION-RULES.md)...${NC}"
        $0 merge-a
        $0 merge-b
        echo ""
        echo -e "${GREEN}Both merged. Coders should run:${NC}"
        echo "  git pull origin main"
        ;;

    push-queues)
        echo -e "${YELLOW}Pushing queue updates...${NC}"
        cd "$PROJECT_DIR"
        git add TASK-QUEUE/
        git commit -m "Update task queues - $(date +%Y-%m-%d)" || true
        git push origin main
        echo -e "${GREEN}Queue updates pushed${NC}"
        ;;

    # ============================================================
    # LOG COMMANDS
    # ============================================================

    logs)
        echo -e "${GREEN}=== ALL LOGS ===${NC}"
        echo ""
        echo -e "${CYAN}--- Completed ---${NC}"
        cat "$QUEUE_DIR/completed.log" | grep -v "^#"
        echo ""
        echo -e "${RED}--- Blocked ---${NC}"
        cat "$QUEUE_DIR/blocked.log" | grep -v "^#"
        echo ""
        echo -e "${YELLOW}--- Human Requests ---${NC}"
        cat "$QUEUE_DIR/human-request.log" | grep -v "^#"
        ;;

    clear-logs)
        echo "# Completed Tasks Log" > "$QUEUE_DIR/completed.log"
        echo "# Format: [YYYY-MM-DD HH:MM] [ROLE] description" >> "$QUEUE_DIR/completed.log"
        echo "" >> "$QUEUE_DIR/completed.log"

        echo "# Blocked Tasks Log" > "$QUEUE_DIR/blocked.log"
        echo "# Format: [YYYY-MM-DD HH:MM] [ROLE] BLOCKED: reason" >> "$QUEUE_DIR/blocked.log"
        echo "" >> "$QUEUE_DIR/blocked.log"

        echo "# Human Request Log" > "$QUEUE_DIR/human-request.log"
        echo "# Format: [YYYY-MM-DD HH:MM] [ROLE] REQUEST: question" >> "$QUEUE_DIR/human-request.log"
        echo "" >> "$QUEUE_DIR/human-request.log"

        echo -e "${GREEN}Logs cleared${NC}"
        ;;

    # ============================================================
    # HELP
    # ============================================================

    help|--help|-h|"")
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  DISPATCH.SH - Multi-Terminal Claude Code Orchestrator${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${CYAN}LAUNCH (fresh start - agent reads @COLLABORATION-RULES.md):${NC}"
        echo "  start-all        Show commands to start all 3 terminals"
        echo "  start-a          Launch CODER-A (reads rules, queue, interfaces)"
        echo "  start-b          Launch CODER-B (reads rules, queue, interfaces)"
        echo "  start-super      Launch SUPERVISOR (reads rules, checklists)"
        echo ""
        echo -e "${CYAN}CONTINUE (agent lost context):${NC}"
        echo "  continue-a       Resume CODER-A with context refresh"
        echo "  continue-b       Resume CODER-B with context refresh"
        echo "  continue-super   Resume SUPERVISOR with context refresh"
        echo ""
        echo -e "${CYAN}QUICK TASK (one-off command):${NC}"
        echo "  task-a \"...\"     Send task to CODER-A"
        echo "  task-b \"...\"     Send task to CODER-B"
        echo "  task-super \"...\" Send task to SUPERVISOR"
        echo ""
        echo -e "${CYAN}STATUS:${NC}"
        echo "  status           Show progress of all agents"
        echo "  watch            Live-watch status (5s refresh)"
        echo "  logs             Show all communication logs"
        echo ""
        echo -e "${CYAN}QUEUE MANAGEMENT:${NC}"
        echo "  add-task <a|b|super> \"task\"   Add task to queue"
        echo "  unblock <a|b|super> [msg]      Signal unblock"
        echo "  respond \"message\"             Respond to human request"
        echo "  push-queues                    Commit & push queue changes"
        echo ""
        echo -e "${CYAN}GIT:${NC}"
        echo "  sync             Pull all branches"
        echo "  merge-a          Merge CODER-A to main"
        echo "  merge-b          Merge CODER-B to main"
        echo "  merge-both       Merge both (A first per rules)"
        echo ""
        echo -e "${CYAN}LOGS:${NC}"
        echo "  logs             Show all logs"
        echo "  clear-logs       Clear all logs"
        echo ""
        echo -e "${YELLOW}Key files agents will read:${NC}"
        echo "  @COLLABORATION-RULES.md - Branch/file ownership rules"
        echo "  @ROLES/terminal-*.md    - Role-specific instructions"
        echo "  @TASK-QUEUE/queue-*.md  - Task queues"
        echo "  @src/types/interfaces.ts - Shared contracts"
        ;;

    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run './dispatch.sh help' for usage"
        exit 1
        ;;
esac
