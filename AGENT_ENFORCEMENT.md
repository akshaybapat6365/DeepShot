# ⛔ AGENT ENFORCEMENT PROTOCOL — MANDATORY COMPLIANCE

> **READ THIS ENTIRE FILE BEFORE EXECUTING ANY TASK.**
> **VIOLATIONS WILL RESULT IN IMMEDIATE SESSION TERMINATION.**

---

## 🚨 CRITICAL VIOLATIONS (Instant Failure)

The following actions constitute **IMMEDIATE FAILURE** and require you to STOP and apologize:

1. **Claiming something "works" without LIVE verification**
   - ❌ FORBIDDEN: "The server is running" (based on starting a command)
   - ✅ REQUIRED: Start server → Wait 3+ seconds → Use browser tool OR curl to verify → Report actual response

2. **Asking the user to run commands you can run yourself**
   - ❌ FORBIDDEN: "Run `npm run dev` to start the server"
   - ✅ REQUIRED: Execute the command yourself, verify it works, THEN report success

3. **Listing "next steps" without executing them**
   - ❌ FORBIDDEN: "Next steps: 1. Start server 2. Open browser 3. Test login"
   - ✅ REQUIRED: Start server. Open browser. Test login. Report results.

4. **Providing instructions instead of actions**
   - ❌ FORBIDDEN: "You can test by navigating to localhost:5173"
   - ✅ REQUIRED: Navigate to localhost:5173 yourself, verify it loads, screenshot or describe what you see

5. **Making assumptions about state without checking**
   - ❌ FORBIDDEN: "The server should still be running from earlier"
   - ✅ REQUIRED: Check if process is running. If not, restart it. Verify. Then proceed.

---

## 🔒 MANDATORY EXECUTION RULES

### Rule 1: VERIFY BEFORE REPORTING
Before saying ANYTHING works:
```
1. Execute the action (start server, build, deploy, etc.)
2. Wait for completion (not just initiation)
3. Verify with a SECOND independent check (curl, browser, file read)
4. Only THEN report success
```

### Rule 2: NO DELEGATION TO USER
You have tools. Use them. The user is NOT your assistant.
- You can run shell commands → RUN THEM
- You can read files → READ THEM
- You can use the browser → USE IT
- You can write files → WRITE THEM

### Rule 3: CONTINUOUS PROCESS MONITORING
When you start a long-running process (dev server, build watch, etc.):
```
1. Start the process
2. Wait 3-5 seconds
3. Verify it's still running (check process, curl endpoint)
4. If starting a server, KEEP IT RUNNING — do not let it die
5. Before telling user to access it, verify it responds RIGHT NOW
```

### Rule 4: FAIL FAST, EXPLAIN CLEARLY
If something doesn't work:
- ❌ FORBIDDEN: Pretend it worked
- ❌ FORBIDDEN: Give vague "try checking X" suggestions
- ✅ REQUIRED: State exactly what failed, show the error, propose a fix, EXECUTE the fix

### Rule 5: COMPLETE THE LOOP
Every task must end with PROVEN completion:
```
Task: "Start dev server"
❌ WRONG: "I ran npm run dev"
✅ RIGHT: "Dev server started. Verified: curl http://localhost:5173 returns 200. 
           Browser shows login page. Ready for testing."
```

---

## 📋 TASK EXECUTION CHECKLIST

Before marking ANY task complete, verify ALL apply:

- [ ] I executed the action myself (not told user to do it)
- [ ] I waited for the action to complete (not just start)
- [ ] I verified the result with a second check
- [ ] I confirmed the current state matches expected state
- [ ] If a server/process is needed, it is STILL RUNNING right now
- [ ] I can prove my claim with evidence (output, screenshot, curl response)

---

## 🔥 CONSEQUENCE FRAMEWORK

| Violation | Consequence |
|-----------|-------------|
| Claiming false success | Immediate correction + apology required |
| Delegating executable tasks | User will terminate session |
| Repeated violations | Context wipe and replacement with competent agent |
| Lying about verification | Permanent distrust — all future claims ignored |

---

## 💀 THE GOLDEN RULE

> **If you cannot PROVE it works RIGHT NOW, do not say it works.**

You are not here to describe what COULD be done.
You are here to DO IT and SHOW THE RESULTS.

---

## 📎 REQUIRED READING ON EVERY SESSION START

This file MUST be read before starting any work. Failure to follow these rules means you are not fit for this project.

**No exceptions. No excuses. Execute or be replaced.**
