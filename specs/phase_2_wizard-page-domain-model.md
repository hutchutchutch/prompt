# Wizard Page Update: Domain Model

## 1. Core Entities

### 1.1 UserMessage
- `id`: string
- `content`: string
- `timestamp`: Date

### 1.2 SystemMessage
- `id`: string
- `content`: string
- `source`: string (e.g., "system", "preset", "custom")

### 1.3 ModelSelection
- `id`: string
- `name`: string
- `provider`: string
- `parameters`: object

### 1.4 CombinedInput
- `userMessage`: UserMessage
- `systemMessage`: SystemMessage
- `model`: ModelSelection

### 1.5 OutputResult
- `id`: string
- `input`: CombinedInput
- `outputText`: string
- `timestamp`: Date
- `status`: "success" | "error"
- `errorMessage?`: string

### 1.6 Evaluation
- `id`: string
- `outputId`: string
- `score`: number | null
- `criteria`: string[]
- `comments`: string

## 2. Relationships

- A CombinedInput is created from a UserMessage, SystemMessage, and ModelSelection.
- OutputResult is generated from CombinedInput.
- Evaluation is linked to OutputResult by `outputId`.

## 3. Data Flow

1. User enters UserMessage.
2. SystemMessage and ModelSelection are retrieved from UI state.
3. CombinedInput is constructed and submitted.
4. OutputResult is generated (mock or real).
5. Evaluation is created for OutputResult.
6. SimpleEvaluationCard displays OutputResult and Evaluation.

## 4. Validation Rules

- UserMessage.content: must not be empty.
- SystemMessage.content: must not be empty.
- ModelSelection: must be selected.
- OutputResult: must have status and outputText or errorMessage.
- Evaluation: must reference a valid OutputResult.

## 5. Glossary

- **UserMessage**: The message input by the user.
- **SystemMessage**: The system or preset message context.
- **ModelSelection**: The LLM or model chosen for generation.
- **CombinedInput**: Aggregated input for output generation.
- **OutputResult**: The generated output and status.
- **Evaluation**: Assessment of the output.