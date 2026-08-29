/**
 * Browser focus styles are computed after focus moves.  Presence alone is not
 * evidence: `outline: 3px solid transparent` and a zero-size shadow both look
 * like an indicator to CSSOM but are invisible to a keyboard user.
 */
export interface FocusStyle {
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
  boxShadow: string;
}

type Rgb = { red: number; green: number; blue: number; alpha: number };

function channel(value: string): number {
  return value.endsWith('%') ? Math.round(Number.parseFloat(value) * 2.55) : Number.parseFloat(value);
}

function alpha(value: string | undefined): number {
  if (!value) return 1;
  return value.endsWith('%') ? Number.parseFloat(value) / 100 : Number.parseFloat(value);
}

export function parseCssColor(value: string): Rgb | undefined {
  const color = value.trim().toLowerCase();
  if (color === 'transparent') return { red: 0, green: 0, blue: 0, alpha: 0 };
  const hex = color.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex) {
    const expanded = hex.length <= 4 ? [...hex].map((part) => part + part).join('') : hex;
    return {
      red: Number.parseInt(expanded.slice(0, 2), 16),
      green: Number.parseInt(expanded.slice(2, 4), 16),
      blue: Number.parseInt(expanded.slice(4, 6), 16),
      alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1
    };
  }
  const match = color.match(/^rgba?\((.*)\)$/);
  if (!match) return undefined;
  const parts = match[1].replace('/', ' ').split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return undefined;
  return { red: channel(parts[0]), green: channel(parts[1]), blue: channel(parts[2]), alpha: alpha(parts[3]) };
}

function composite(foreground: Rgb, background: Rgb): Rgb {
  return {
    red: foreground.red * foreground.alpha + background.red * (1 - foreground.alpha),
    green: foreground.green * foreground.alpha + background.green * (1 - foreground.alpha),
    blue: foreground.blue * foreground.alpha + background.blue * (1 - foreground.alpha),
    alpha: 1
  };
}

function luminanceChannel(value: number): number {
  const normal = value / 255;
  return normal <= 0.04045 ? normal / 12.92 : ((normal + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(first: Rgb, second: Rgb): number {
  const luminance = ({ red, green, blue }: Rgb) => 0.2126 * luminanceChannel(red) + 0.7152 * luminanceChannel(green) + 0.0722 * luminanceChannel(blue);
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function contrasts(color: string, background: string): boolean {
  const foreground = parseCssColor(color);
  const behind = parseCssColor(background) || { red: 255, green: 255, blue: 255, alpha: 1 };
  if (!foreground || foreground.alpha <= 0) return false;
  return contrastRatio(composite(foreground, behind), behind) >= 3;
}

function hasNonZeroShadowGeometry(value: string): boolean {
  const withoutColors = value.replace(/rgba?\([^)]*\)|#[\da-f]{3,8}|transparent/gi, '');
  const dimensions = [...withoutColors.matchAll(/-?(?:\d*\.)?\d+px/g)].map((match) => Number.parseFloat(match[0]));
  return dimensions.some((dimension) => dimension !== 0);
}

/** Returns true only when a computed outline or shadow can actually be seen. */
export function hasVisibleFocusIndicator(style: FocusStyle, backgroundColor = 'rgb(255, 255, 255)'): boolean {
  const outlineWidth = Number.parseFloat(style.outlineWidth);
  if (style.outlineStyle !== 'none' && outlineWidth > 0 && contrasts(style.outlineColor, backgroundColor)) return true;

  if (style.boxShadow === 'none' || !hasNonZeroShadowGeometry(style.boxShadow)) return false;
  const colors = style.boxShadow.match(/rgba?\([^)]*\)|#[\da-f]{3,8}|transparent/gi) || [];
  return colors.some((color) => contrasts(color, backgroundColor));
}
