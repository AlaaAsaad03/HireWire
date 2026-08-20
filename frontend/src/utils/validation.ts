// Email validation
export const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
};

// Password validation
export const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
};

// Name validation
export const validateName = (name: string): string | undefined => {
    if (!name) return 'This field is required';
    if (name.length < 2) return 'Must be at least 2 characters';
    if (name.length > 50) return 'Must be less than 50 characters';
    return undefined;
};

// Company validation
export const validateCompany = (company: string): string | undefined => {
    if (!company) return 'Company name is required';
    if (company.length < 2) return 'Company name must be at least 2 characters';
    return undefined;
};

// Position validation
export const validatePosition = (position: string): string | undefined => {
    if (!position) return 'Position is required';
    if (position.length < 2) return 'Position must be at least 2 characters';
    return undefined;
};

// URL validation
export const validateUrl = (url: string): string | undefined => {
    if (!url) return undefined; // Optional field
    try {
        new URL(url);
        return undefined;
    } catch {
        return 'Please enter a valid URL (e.g., https://example.com)';
    }
};

// Phone validation
export const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined; // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    if (phone.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return undefined;
};

// Date validation
export const validateDate = (date: string): string | undefined => {
    if (!date) return 'Date is required';
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) return 'Invalid date';
    return undefined;
};

// Future date validation (for reminders)
export const validateFutureDate = (date: string): string | undefined => {
    if (!date) return 'Date is required';
    const selectedDate = new Date(date);
    const now = new Date();
    if (isNaN(selectedDate.getTime())) return 'Invalid date';
    if (selectedDate < now) return 'Date must be in the future';
    return undefined;
};

// Salary validation
export const validateSalary = (salary: string): string | undefined => {
    if (!salary) return undefined; // Optional field
    const num = parseFloat(salary);
    if (isNaN(num)) return 'Please enter a valid number';
    if (num < 0) return 'Salary cannot be negative';
    if (num > 10000000) return 'Please enter a reasonable salary';
    return undefined;
};