# Membership Form Hooks

Shared React hooks used across all membership forms (AC, OC, IC, AM).

## Available Hooks

### `useApiData()`

Fetches common API data needed for membership forms:
- Business types
- Industrial groups
- Provincial chapters

**Usage:**
```javascript
import { useApiData } from "@/app/membership/hooks/useApiData";

function MyForm() {
  const { businessTypes, industrialGroups, provincialChapters, isLoading, error } = useApiData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // Use the data...
}
```

**Returns:**
```javascript
{
  businessTypes: Array,
  industrialGroups: Array,
  provincialChapters: Array,
  isLoading: boolean,
  error: string | null
}
```

**Features:**
- ✅ Automatic request cancellation on unmount
- ✅ Error handling with toast notifications
- ✅ Parallel API fetching with Promise.all
- ✅ Automatic data transformation

## Migration Guide

### Before (in each form):
```javascript
const useApiData = () => {
  const [data, setData] = useState({...});
  // ... duplicate code in each form
};
```

### After (shared hook):
```javascript
import { useApiData } from "@/app/membership/hooks/useApiData";

const { businessTypes, industrialGroups, provincialChapters, isLoading, error } = useApiData();
```

## Benefits

- ✅ **DRY Principle**: No code duplication
- ✅ **Consistency**: Same behavior across all forms
- ✅ **Maintainability**: Update once, apply everywhere
- ✅ **Testing**: Test once, trust everywhere
