# Temperature Converter Technical Documentation

## Technology Stack
- HTML
- CSS
- JavaScript

## Architecture
User Interface
-> Validation Module
-> Conversion Engine
-> Result Display

## Conversion Formulas

### Celsius
F = (C × 9/5) + 32
K = C + 273.15

### Fahrenheit
C = (F − 32) × 5/9
K = (F − 32) × 5/9 + 273.15

### Kelvin
C = K − 273.15
F = (K − 273.15) × 9/5 + 32

## Algorithm
1. Read input.
2. Validate input.
3. Convert to Celsius.
4. Calculate other units.
5. Display results.

## Complexity
Time Complexity: O(1)
Space Complexity: O(1)

## Testing
- 25°C -> 77°F, 298.15K
- 32°F -> 0°C, 273.15K
- 300K -> 26.85°C, 80.33°F
