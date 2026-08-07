const glyphs: Record<string, string> = {
  "0": "M10 0H50L60 10V90L50 100H10L0 90V10ZM18 18V82H42V18Z",
  "1": "M25 0H48V100H20V24L8 30V8Z",
  "2": "M5 0H55L62 8V42L25 76H62V100H0V72L38 36V20H5Z",
  "3": "M0 0H55L63 8V38L50 50L63 62V92L55 100H0V76H38V60H12V40H38V24H0Z",
  "4": "M42 0H66V100H42V70H0V48L34 0H60L24 48H42Z",
  "5": "M3 0H62V24H27V36H54L64 46V90L54 100H0V76H38V60H3Z",
  "6": "M10 0H60V24H22V38H54L64 48V90L54 100H10L0 90V10ZM22 60V80H42V60Z",
  ".": "M0 72H28V100H0Z",
  "A": "M25 0H52L78 100H52L48 82H25L20 100H0ZM31 58H43L37 30Z",
  "B": "M0 0H52L64 12V38L54 50L66 62V88L54 100H0ZM24 22V40H38V22ZM24 60V78H40V60Z",
  "C": "M12 0H64V24H24V76H64V100H12L0 88V12Z",
  "D": "M0 0H48L66 18V82L48 100H0ZM24 24V76H38L42 72V28L38 24Z",
  "E": "M0 0H66V24H24V38H58V62H24V76H66V100H0Z",
  "F": "M0 0H66V24H24V42H58V66H24V100H0Z",
  "G": "M12 0H66V24H24V76H44V56H68V100H12L0 88V12Z",
  "H": "M0 0H24V38H48V0H72V100H48V62H24V100H0Z",
  "J": "M42 0H66V88L54 100H8L0 92V68H24V76H42Z",
  "K": "M0 0H24V38L48 0H76L44 48L78 100H50L28 64L24 70V100H0Z",
  "L": "M0 0H24V76H66V100H0Z",
  "N": "M0 0H24L50 56V0H72V100H48L22 44V100H0Z",
  "S": "M10 0H66V24H24V38H56L68 50V88L56 100H0V76H44V62H12L0 50V12Z",
};

export function textToPathData(text: string, x: number, y: number, height: number): string {
  const chars = [...text.toUpperCase()].filter((char) => glyphs[char]);
  const scale = height / 100;
  const totalWidth = chars.reduce((sum, char) => sum + (char === "." ? 32 : 78), 0) * scale;
  let cursor = x - totalWidth / 2;
  const parts: string[] = [];
  for (const char of chars) {
    const width = (char === "." ? 32 : 78) * scale;
    const data = glyphs[char]
      .replace(/([MLHVZ])|(-?\d+(?:\.\d+)?)/g, (token) => {
        if (/^[MLHVZ]$/.test(token)) return token;
        return String(Number(token) * scale);
      })
      .replace(/M([0-9.-]+) ([0-9.-]+)/g, (_, px: string, py: string) => `M${Number(px) + cursor} ${Number(py) + y - height / 2}`)
      .replace(/L([0-9.-]+) ([0-9.-]+)/g, (_, px: string, py: string) => `L${Number(px) + cursor} ${Number(py) + y - height / 2}`)
      .replace(/H([0-9.-]+)/g, (_, px: string) => `H${Number(px) + cursor}`)
      .replace(/V([0-9.-]+)/g, (_, py: string) => `V${Number(py) + y - height / 2}`);
    parts.push(data);
    cursor += width;
  }
  return parts.join(" ");
}
