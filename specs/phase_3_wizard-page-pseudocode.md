# Wizard Page Update: High-Level Pseudocode & TDD Anchors

## 1. User Message Input Component

```pseudo
Component: UserMessageInput
  State:
    - userMessage: string
    - isSubmitting: boolean

  Render:
    - Text input for user message
    - Submit button (disabled if isSubmitting)

  OnSubmit:
    - Validate userMessage is not empty
      // TEST: Submitting empty message shows validation error
    - Call onSubmit(userMessage)
      // TEST: Valid message triggers onSubmit with correct value
    - Set isSubmitting true during processing
      // TEST: Submit button disables during submission
```

## 2. Aggregation Logic

```pseudo
Function: aggregateInput(userMessage, systemMessage, modelSelection)
  - Validate all inputs are present
    // TEST: Missing userMessage triggers error
    // TEST: Missing systemMessage triggers error
    // TEST: Missing modelSelection triggers error
  - Return CombinedInput object
    // TEST: Aggregated input structure is correct
```

## 3. Output Generation Logic

```pseudo
Function: generateOutput(combinedInput, mode)
  - If mode == "mock":
      - Return mock output
      // TEST: Mock mode returns predictable output
  - Else:
      - Call real output generation (async)
      // TEST: Real mode calls backend/service
  - Handle errors (network, invalid input, etc.)
    // TEST: Output generation error is handled and surfaced
  - Return OutputResult (with status, outputText or errorMessage)
    // TEST: OutputResult structure is correct for success and error
```

## 4. Evaluation Logic

```pseudo
Function: evaluateOutput(outputResult)
  - If outputResult.status == "success":
      - Generate evaluation (mock or real)
      // TEST: Evaluation is generated for successful output
  - Else:
      - Return evaluation with error status
      // TEST: No evaluation for failed output
  - Return Evaluation object
    // TEST: Evaluation structure is correct
```

## 5. Display Logic

```pseudo
Component: SimpleEvaluationCard
  Props:
    - outputResult: OutputResult
    - evaluation: Evaluation

  Render:
    - If outputResult.status == "success":
        - Show outputText and evaluation details
        // TEST: Output and evaluation are displayed for success
    - Else:
        - Show error message
        // TEST: Error message is displayed for failed output
```

## 6. Main Wizard Page Flow

```pseudo
Component: WizardPage
  State:
    - userMessage: string
    - systemMessage: string
    - modelSelection: ModelSelection
    - outputResult: OutputResult | null
    - evaluation: Evaluation | null
    - isLoading: boolean
    - error: string | null

  Render:
    - PromptCarousel
    - UserMessageInput (below PromptCarousel)
    - ModelCarousel
    - Submit button (triggers handleSubmit)
    - SimpleEvaluationCard (shows outputResult and evaluation)

  Function: handleSubmit()
    - Aggregate input
    - Validate all required fields
      // TEST: Submission with missing fields is blocked
    - Set isLoading true
    - Call generateOutput
    - On success, call evaluateOutput
    - Update outputResult and evaluation state
    - Handle and display errors
      // TEST: All error states are handled and shown in UI
    - Set isLoading false
```

## 7. Edge Case Handling

- Rapid repeated submissions: disable submit during processing
  // TEST: Multiple rapid submits are prevented
- Async errors: show user-friendly error messages
  // TEST: Async errors are surfaced in UI
- Input validation: all fields validated before submission
  // TEST: Invalid input blocks submission

## 8. Performance Considerations

- UI remains responsive during async operations
  // TEST: Loading indicators shown during processing

## 9. Security & Modularity

- No hard-coded secrets or env vars
  // TEST: No secrets or env vars in code
- All logic is modular and testable
  // TEST: Each function/component is independently testable