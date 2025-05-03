# Manual Accessibility Testing Guide

This guide provides steps for manually testing the accessibility of the Personal Finance Dashboard.

## Prerequisites

- Familiarity with keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- A screen reader (NVDA for Windows, VoiceOver for macOS, or JAWS)
- Knowledge of WCAG 2.1 AA standards

## Testing Procedures

### 1. Keyboard Navigation

#### Focus Visibility
- Tab through all interactive elements
- Verify the focus indicator is clearly visible
- Ensure the focus order is logical and follows the visual layout

#### Test Steps:
1. Start from the top of the page
2. Press Tab repeatedly to move through all focusable elements
3. Check that you can access all interactive elements
4. Verify you don't get trapped in any component
5. Test Shift+Tab to navigate backward

#### Expected Results:
- All interactive elements receive focus
- Focus is clearly visible at all times
- Focus order follows a logical sequence
- No keyboard traps exist

### 2. Screen Reader Testing

#### Basic Navigation
- Test navigating with screen reader commands
- Verify all content is announced correctly
- Test form field labels and error messages

#### Test Steps:
1. Turn on your screen reader
2. Navigate through headings (H key in NVDA/JAWS)
3. Navigate through landmarks (D key in NVDA)
4. Navigate form fields (F key in NVDA)
5. Check that images have descriptive alt text

#### Expected Results:
- All content is correctly announced
- Page structure is clear through headings and landmarks
- Form fields are properly labeled
- Dynamic content changes are announced

### 3. Color and Contrast

#### Test Steps:
1. Use a contrast analyzer browser extension
2. Check text contrast against backgrounds
3. Test with color blindness simulator
4. Ensure color isn't the only means of conveying information

#### Expected Results:
- Text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Interface is usable in grayscale
- Critical information isn't conveyed by color alone

### 4. Form Validation

#### Test Steps:
1. Submit forms with errors
2. Check that error messages are announced by screen readers
3. Verify that error states are conveyed visually and programmatically
4. Test the form with keyboard only

#### Expected Results:
- Error messages are clear and specific
- Errors are linked to their corresponding fields
- Focus moves to the first field with an error
- Required fields are clearly indicated

### 5. Dynamic Content

#### Test Steps:
1. Test modal dialogs and popups
2. Check that notifications are announced
3. Verify focus management when content changes
4. Test loading states

#### Expected Results:
- Modal dialogs trap focus appropriately
- Dynamic content changes are announced to screen readers
- Focus is managed when the interface changes
- Loading states are conveyed non-visually

## Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus is always visible
- [ ] All content can be accessed with a screen reader
- [ ] Heading structure is logical and sequential
- [ ] ARIA landmarks are used correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Dynamic content is announced to screen readers
- [ ] Form validation errors are accessible
- [ ] Page is usable at 200% zoom
- [ ] Page works in both portrait and landscape orientations
- [ ] No content flashes more than 3 times per second

## Resources

- [WebAIM: Web Accessibility In Mind](https://webaim.org/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/) 