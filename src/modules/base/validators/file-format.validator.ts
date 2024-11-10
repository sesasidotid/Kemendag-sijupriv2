import { AbstractControl, ValidatorFn } from '@angular/forms';

export function fileValidator(allowedTypes: string[], maxSizeMB: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const base64String = control.value;

    if (!base64String) {
      return null; // No file, so it's valid
    }

    try {
      // Check if the file MIME type matches any of the allowed types
      const isAllowedType = allowedTypes.some(type => base64String.startsWith(`data:${type};base64,`));
      if (!isAllowedType) {
        return { invalidFileType: true };
      }

      // Calculate the file size in MB
      const fileSizeInBytes = (base64String.length * 3) / 4 - 2; // Approximation for base64 to binary size
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

      if (fileSizeInMB > maxSizeMB) {
        return { fileTooLarge: true };
      }
    } catch (error) {
      return { invalidFileFormat: true }; // If conversion or size calculation fails
    }

    return null;
  };
}
