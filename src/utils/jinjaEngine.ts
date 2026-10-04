/**
 * Lightweight client/edge Jinja2-compatible templating parser.
 * Handles:
 * - Variable substitution: {{ variable_name }}
 * - Conditionals: {% if var == 'val' %} or {% if var %} ... {% else %} ... {% endif %}
 * - Safe fallback for undefined keys
 */

export function renderJinjaTemplate(
  templateString: string,
  context: Record<string, any>
): string {
  let output = templateString;

  // Process {% if ... %} {% else %} {% endif %}
  const conditionalRegex = /\{%\s*if\s+([^%]+)\s*%\}([\s\S]*?)(?:\{%\s*else\s*%\}([\s\S]*?))?\{%\s*endif\s*%\}/g;

  output = output.replace(conditionalRegex, (_, conditionRaw, ifBranch, elseBranch = '') => {
    const condition = conditionRaw.trim();
    let isTrue = false;

    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''));
      const val = context[left] !== undefined ? String(context[left]) : '';
      isTrue = val === right;
    } else if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''));
      const val = context[left] !== undefined ? String(context[left]) : '';
      isTrue = val !== right;
    } else {
      // Truthy check
      const val = context[condition];
      isTrue = Boolean(val && val !== 'false' && val !== '0');
    }

    return isTrue ? ifBranch : elseBranch;
  });

  // Process {{ variable }}
  const varRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  output = output.replace(varRegex, (match, varName) => {
    if (context[varName] !== undefined && context[varName] !== null) {
      return String(context[varName]);
    }
    // Return gracefully formatted fallback
    return `[${varName}]`;
  });

  return output.trim();
}

/**
 * Extracts list of {{ var }} identifiers from raw Jinja2 string
 */
export function extractJinjaVariables(templateString: string): string[] {
  const matches = templateString.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/[\{\}\s]/g, ''));
  return Array.from(new Set(vars));
}
