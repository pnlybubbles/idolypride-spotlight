export const validSpaceSeparatedPositiveInt = (value: string) => /^(([1-9][0-9]*)|\s)*$/.test(value)
export const validPositiveInt = (value: string) => /^[1-9][0-9]*$/.test(value)
