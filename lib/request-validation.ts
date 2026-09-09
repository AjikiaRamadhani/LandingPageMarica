export function validateText(value: unknown, field: string, maxLength = 200) {
  if (typeof value !== "string") {
    return { error: `${field} harus berupa teks` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { error: `${field} tidak boleh kosong` };
  }

  if (trimmed.length > maxLength) {
    return { error: `${field} terlalu panjang` };
  }

  return { value: trimmed };
}

export function validateOptionalText(value: unknown, field: string, maxLength = 200) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${field} harus berupa teks` };
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    return { error: `${field} terlalu panjang` };
  }

  return { value: trimmed || null };
}

export function validateInteger(value: unknown, field: string, min = 0) {
  if (!Number.isInteger(value) || Number(value) < min) {
    return { error: `${field} tidak valid` };
  }

  return { value: Number(value) };
}
