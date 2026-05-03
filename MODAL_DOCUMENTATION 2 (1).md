# Modal / Dialog Component Library

A production-ready, accessible dialog system with three usage variants: Info, Confirm, and Form. Built with React, Tailwind CSS, and fully keyboard accessible.

## Features

- ✅ **Accessible**: Keyboard navigation, ARIA attributes, focus management
- ✅ **Responsive**: Works seamlessly on mobile, tablet, and desktop
- ✅ **Dismissible**: Click backdrop, ESC key, or close button
- ✅ **Animated**: Smooth transitions with backdrop blur
- ✅ **Three Variants**: Info (informational), Confirm (destructive), Form (data entry)
- ✅ **Type-Safe**: Full React component structure
- ✅ **Production-Ready**: Error handling, loading states, form validation

---

## Installation

### Requirements
- React 16.8+
- Tailwind CSS 3.0+
- lucide-react (for icons)

### Setup

```bash
npm install lucide-react
```

Copy the component file to your project and import:

```jsx
import { Modal, InfoModal, ConfirmModal, FormModal } from './ModalDialog';
```

---

## Core Modal Component

The base `Modal` component handles backdrop, animations, and keyboard interactions.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Called when modal should close |
| `children` | ReactNode | Yes | Modal content |
| `variant` | string | No | Modal variant (default, info, confirm, form) |
| `size` | string | No | Size: 'sm' \| 'md' \| 'lg' (default: 'md') |

### Basic Usage

```jsx
import { Modal } from './ModalDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <h2>Custom Content</h2>
        <p>Your content here</p>
      </Modal>
    </>
  );
}
```

---

## Info Modal

Displays informational content with a single call-to-action button.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls visibility |
| `onClose` | function | Yes | Close handler |
| `title` | string | No | Modal title (default: "Info") |
| `message` | string | Yes | Main message text |
| `icon` | React Component | No | Icon component from lucide-react |

### Example

```jsx
import { InfoModal, Info } from 'lucide-react';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Show Info</button>
      <InfoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Update Available"
        message="A new version of the app is available. Please update to get the latest features."
        icon={Info}
      />
    </>
  );
}
```

### Use Cases
- Feature announcements
- Informational alerts
- Success confirmations
- Release notes

---

## Confirm Modal

Requests confirmation for a destructive or important action.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls visibility |
| `onClose` | function | Yes | Close handler |
| `onConfirm` | async function | Yes | Called when user confirms |
| `title` | string | No | Modal title (default: "Confirm") |
| `message` | string | Yes | Confirmation message |
| `isDangerous` | boolean | No | Red styling for dangerous actions (default: false) |
| `icon` | React Component | No | Icon component from lucide-react |

### Example

```jsx
import { ConfirmModal } from './ModalDialog';
import { Trash2 } from 'lucide-react';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await api.deleteItem(itemId);
    // Modal automatically closes after onConfirm completes
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Delete Item</button>
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure? This action cannot be undone."
        isDangerous={true}
        icon={Trash2}
      />
    </>
  );
}
```

### Use Cases
- Permanent deletions
- Account deactivation
- Destructive operations
- Irreversible changes

---

## Form Modal

Collects user input with validation and submission handling.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls visibility |
| `onClose` | function | Yes | Close handler |
| `onSubmit` | async function | Yes | Called with form data on submit |
| `title` | string | No | Modal title (default: "Edit Profile") |

### Form Data Structure

```jsx
{
  fullName: string,
  email: string,
  bio: string
}
```

### Example

```jsx
import { FormModal } from './ModalDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData) => {
    const response = await api.updateProfile(formData);
    return response; // Modal closes on success
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Edit Profile</button>
      <FormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        title="Update Your Info"
      />
    </>
  );
}
```

### Customizing Form Fields

Extend `FormModal` to add additional fields:

```jsx
function CustomFormModal() {
  const [formData, setFormData] = useState({
    company: '',
    website: '',
    phone: ''
  });

  // Implement custom handleChange and handleSubmit
  // Update JSX with additional input fields
}
```

### Use Cases
- Profile editing
- Settings configuration
- Data entry forms
- Account management

---

## Accessibility

All modals include:

- **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`
- **Keyboard Navigation**:
  - ESC key closes the modal
  - Tab cycles through focusable elements
  - Focus trapped within modal when open
- **Screen Reader Support**: Proper labels and descriptions
- **Focus Management**: Automatically restores focus to trigger element on close
- **Semantic HTML**: Proper button and form elements

### WCAG 2.1 Compliance
- Level AA accessibility
- Proper color contrast
- Keyboard accessible
- Screen reader friendly

---

## Styling & Customization

### Tailwind Classes

The component uses Tailwind CSS utility classes. Customize by:

1. **Color Scheme**: Update color classes (blue-600, red-600, purple-600)
2. **Border Radius**: Modify `rounded-` values
3. **Spacing**: Adjust `p-` and `gap-` utilities
4. **Shadows**: Change `shadow-2xl` and `shadow-lg`

### Custom Theme

```jsx
// Override button styles
<button className="YOUR_CUSTOM_CLASS">
  Custom Button
</button>

// Or use CSS-in-JS
<button style={{ backgroundColor: '#yourColor' }}>
  Custom Button
</button>
```

### Dark Mode

Extend Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

Then add dark mode classes to components:

```jsx
<div className="bg-white dark:bg-gray-900">
```

---

## Advanced Patterns

### Nested Modals

```jsx
function NestedExample() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);

  return (
    <>
      <Modal isOpen={first} onClose={() => setFirst(false)}>
        <button onClick={() => setSecond(true)}>Open Second</button>
      </Modal>
      <Modal isOpen={second} onClose={() => setSecond(false)}>
        <h2>Second Modal</h2>
      </Modal>
    </>
  );
}
```

### Form with Custom Validation

```jsx
function ValidatedForm() {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const newErrors = {};
    if (!data.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    return newErrors;
  };

  const handleSubmit = async (data) => {
    const newErrors = validate(data);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Submit...
  };
}
```

### Loading States

```jsx
const [loading, setLoading] = useState(false);

const handleConfirm = async () => {
  setLoading(true);
  try {
    await longRunningTask();
  } finally {
    setLoading(false);
  }
};
```

---

## API Reference

### Modal
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `children: ReactNode` - Modal content
- `variant?: string` - Modal type
- `size?: 'sm' | 'md' | 'lg'` - Modal size

### InfoModal
- All Modal props +
- `title?: string` - Title text
- `message: string` - Body message
- `icon?: React.ComponentType` - Icon component

### ConfirmModal
- All Modal props +
- `title?: string` - Title text
- `message: string` - Confirmation message
- `onConfirm: () => Promise<void>` - Confirmation handler
- `isDangerous?: boolean` - Danger styling
- `icon?: React.ComponentType` - Icon component

### FormModal
- All Modal props +
- `title?: string` - Title text
- `onSubmit: (data: FormData) => Promise<void>` - Form submission handler

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Performance

- **Zero Dependencies**: Only lucide-react for icons
- **Minimal Re-renders**: Optimized state management
- **Smooth Animations**: CSS-based transitions (60fps)
- **Lazy Loading**: Modals only render when open

---

## Troubleshooting

### Modal not closing on ESC key
Ensure `onClose` is properly connected and the modal has focus.

### Form not submitting
Check that `onSubmit` returns a Promise and properly awaits async operations.

### Backdrop not dismissing
Verify `onClose` is being passed and functional.

### Styling conflicts
Check for Tailwind CSS conflicts with global styles. Use CSS specificity or Tailwind's `!important` modifier if needed.

---

## License

MIT - Use freely in personal and commercial projects

---

## Support

For issues or feature requests, refer to the component's inline documentation and accessibility guidelines (WCAG 2.1 AA).
