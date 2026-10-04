# T.H.E.O. Phone V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a phone-first T.H.E.O. Python core that runs locally from `~/theo` with persistent memory, safe file access, and optional Termux Android actions.

**Architecture:** Keep the core dependency-free and split responsibilities into configuration, memory, files, Android bridge, and command routing. Sensitive actions are opt-in and require explicit commands; no hidden background control is implemented.

**Tech Stack:** Python 3, standard library, optional Termux:API command-line tools.

**Spec:** T.H.E.O. phone architecture agreed in chat on 2026-10-04.

## Global Constraints

- Launch command: `python theo.py`
- Working directory: `~/theo`
- Phone is the primary machine; no PC is required.
- Local memory is JSON; no cloud dependency is required for V1.
- File access is restricted to configured roots.
- Android actions are explicit commands and use Termux tools only when installed.
- T.H.E.O. must fail safely when an optional Android capability is unavailable.

## Review Focus

- First launch with no data directory must create it safely.
- Corrupt memory JSON must not crash the assistant.
- File requests outside allowed roots must be rejected.
- Missing Termux commands must return a useful capability message rather than crash.
- Unknown commands must remain conversational instead of executing arbitrary shell input.

### Task 1: Core configuration and memory

**Files:** `theo/config.py`, `theo/memory.py`, `theo/__init__.py`, `tests/test_memory.py`

- [ ] Implement configuration paths under `~/theo/data`.
- [ ] Implement JSON memory with safe load/save and corruption recovery.
- [ ] Test first-run creation and persistence.

### Task 2: Safe file access

**Files:** `theo/files.py`, `tests/test_files.py`

- [ ] Implement configured-root validation and text-file listing/reading.
- [ ] Reject paths escaping configured roots.
- [ ] Test allowed and denied paths.

### Task 3: Android bridge

**Files:** `theo/android.py`, `tests/test_android.py`

- [ ] Detect Termux commands without raising on missing binaries.
- [ ] Provide notification, battery, and clipboard operations through explicit methods.
- [ ] Test missing-command behavior without requiring Android.

### Task 4: Command router and executable

**Files:** `theo/core.py`, `theo.py`, `tests/test_core.py`

- [ ] Route `/help`, `/status`, `/memory`, `/remember`, `/files`, `/battery`, `/notify`, `/quit`.
- [ ] Keep arbitrary shell execution disabled.
- [ ] Make `python theo.py` start an interactive local loop.
- [ ] Run the full test suite.
