# Wizard Page Update: Requirements & Constraints

## 1. Functional Requirements

### 1.1 User Message Input
- Display a user message input field below the PromptCarousel.
- Allow users to enter and submit a message.

### 1.2 Input Aggregation
- On submit, combine:
  - User Message (from input)
  - System Message (from context or selection)
  - Selected Model (from ModelCarousel)

### 1.3 Output Generation
- Generate an output using the combined input.
- Support both mock and real output generation (toggle or config).
- No hard-coded environment variables or secrets.

### 1.4 Output & Evaluation Display
- Display the generated output and its evaluation in SimpleEvaluationCard.

## 2. Edge Cases

- User submits empty message.
- System message is missing or invalid.
- No model is selected.
- Output generation fails (mock or real).
- Evaluation data is missing or malformed.
- Rapid repeated submissions.
- Network or async errors during output generation.

## 3. Constraints

- All user inputs must be validated before processing.
- No hard-coded secrets or environment variables.
- Design must be modular and testable.
- Error handling must be explicit and user-friendly.
- Performance: UI should remain responsive during async operations.
- No direct dependencies on backend APIs for mock mode.

## 4. Non-Functional Requirements

- Accessibility: Input and output components must be accessible.
- Security: Sanitize all user inputs.
- Scalability: Logic should support future extension (e.g., more input types, models).
- Maintainability: Code must be modular, with clear boundaries for input, aggregation, output, and evaluation logic.

## 5. Acceptance Criteria

- User can submit a message and see output/evaluation.
- All edge cases are handled gracefully.
- No hard-coded secrets or env vars.
- All logic is covered by TDD anchors in pseudocode.