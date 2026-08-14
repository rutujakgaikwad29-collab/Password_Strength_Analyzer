# Password Strength Analyzer

A simple, professional, client-side tool that checks how strong a password is, explains why, and can generate a strong one for you.

## Project Description

This is a beginner-friendly Cyber Security internship project. It analyzes a password as the user types and reports how strong it is, using a clear point-based scoring system, a live requirements checklist, pattern warnings, and dynamic suggestions.

## Objective

Build a tool that evaluates password strength based on length, character variety, common-password detection, and predictable patterns — and clearly explains the result to the user.

## Features

- Real-time analysis while typing (no submit button needed)
- Strength rating: Weak, Medium, Strong, Very Strong, shown with both text and a colored bar (never color alone)
- Clear 0–7 point scoring system
- Live requirements checklist (8 items)
- Common-password detection with a warning
- Pattern warnings for repeated characters, sequential characters, and keyboard patterns (e.g. `qwerty`)
- Dynamic, situation-specific suggestions
- Strong password generator using `crypto.getRandomValues()`, with adjustable length (8–32) and a copy button
- Show/Hide password and Clear button
- Fully responsive layout
- No backend, no external requests, no storage, no logging

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

No frameworks, libraries, or build tools are used.

## How the Application Works

1. The user types a password into the input field.
2. On every keystroke, `analyzePassword()` runs in memory and:
   - Checks length, and whether it contains lowercase, uppercase, numbers, and special characters
   - Checks the password against a built-in common-password list
   - Checks for repeated characters, sequential characters, and simple keyboard patterns
3. The results update the strength bar, the requirements checklist, the pattern warnings, and the suggestions — instantly, with no page reload or server call.

## Password Scoring Methodology

The score is a simple point system out of **7**:

| Requirement | Points |
|---|---|
| 8 or more characters | +1 |
| 12 or more characters | +1 |
| Contains a lowercase letter | +1 |
| Contains an uppercase letter | +1 |
| Contains a number | +1 |
| Contains a special character | +1 |
| Is not a commonly used password | +1 |

**Rating scale:**

| Score | Rating |
|---|---|
| 0–2 | Weak |
| 3–4 | Medium |
| 5–6 | Strong |
| 7 | Very Strong |

Repeated characters, sequential characters (`1234`), and keyboard patterns (`qwerty`) do not subtract points directly — they are shown separately as **Pattern Warnings** instead. This keeps the scoring formula easy to follow for a beginner reader, while still making sure the user is warned about predictable passwords that technically satisfy every character-type rule (for example, `Qwerty123!` would score well on the checklist but still receive a keyboard-pattern warning).

## Security Considerations

- All analysis happens **entirely in the browser** — nothing is calculated on a server.
- The password is **never sent** over the network.
- The password is **never stored** in `localStorage`, `sessionStorage`, or cookies.
- The password is **never logged** with `console.log()` or any other logging call.
- No analytics or tracking scripts are included.
- The generator uses `crypto.getRandomValues()`, not `Math.random()`, for cryptographically strong randomness.
- This tool is an **estimate**, not a guarantee of real-world security. It does not replace a professional security audit, and its common-password list is a small, non-exhaustive sample.

## How to Run the Project

1. Put `index.html`, `style.css`, and `script.js` in the same folder.
2. Double-click `index.html` to open it in any modern browser.
3. No installation, server, or internet connection is required.

## Testing Examples

| Password | Score | Rating | Why |
|---|---|---|---|
| `123456` | 1 / 7 | Weak | Meets only the 8-character point; common password (no point); no letters or symbols |
| `password` | 2 / 7 | Weak | Has lowercase letters and 8+ length, but it's a common password |
| `hello123` | 4 / 7 | Medium | Has lowercase + number + 8+ length, but no uppercase or symbol |
| `Hello123` | 5 / 7 | Strong | Adds an uppercase letter on top of `hello123` |
| `Hello@12345` | 6 / 7 | Strong | Has all character types and 11 characters, just short of the 12-character bonus point |
| Long random password (20+ characters, all types) | 7 / 7 | Very Strong | Meets every scoring criterion |

Also try these to see the other features in action:

- **Empty input** → strength area shows "Enter a password above"
- **`aaaaaaaa`** → triggers the repeated-characters pattern warning
- **`abcdefgh`** → triggers the sequential-pattern warning
- **`qwertyui`** → triggers the keyboard-pattern warning
- **A password with a space** → fails the "Does not contain spaces" checklist item
- **Generate Strong Password** → fills the input with a fresh random password and shows it scoring 7 / 7

## Limitations

- The common-password list is small and does not represent every weak password in existence.
- Pattern detection is heuristic (rule-based), not a full dictionary or breach-database check.
- This tool cannot guarantee a password is unbreakable or safe from every possible attack.
- It does not check whether a password has appeared in a real data breach.

## Future Improvements

- Add an estimated entropy (bits) calculation for a more technical strength measure.
- Load a larger common-password list from a bundled file instead of a small in-code list.
- Add a dictionary-word check using a bundled word list.
- Add multi-language support for the interface and suggestions.
- Add automated unit tests for the scoring and pattern-detection functions.

## Author

**[Your Name Here]**
Cyber Security Intern — Password Strength Analyzer Project
