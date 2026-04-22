```md
# Audit Output Template

Generate CSV rows using columns:

timestamp,
file_path,
file_type,
conflict_type,
head_side_used,
incoming_side_used,
decision_taken,
risk_level,
manual_review_needed,
resolved

## Example

2026-04-22T10:30:00,
src/main/UserService.java,
java,
method_enhancement,
partial,
partial,
combined validation and logging,
medium,
no,
yes
```
