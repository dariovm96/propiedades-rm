import fs from 'node:fs/promises';
import process from 'node:process';

const EXCEPTIONS_FILE = '.github/security-exceptions.yaml';

const REQUIRED_EXCEPTION_FIELDS = ['id', 'owner.team', 'owner.contact', 'evidence.url', 'expiry'];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function validateIsoDate(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const timestamp = Date.parse(`${dateString}T00:00:00.000Z`);
  return Number.isFinite(timestamp);
}

function isExpired(dateString, now) {
  const expiry = new Date(`${dateString}T23:59:59.999Z`);
  return expiry.getTime() < now.getTime();
}

async function main() {
  let raw;

  try {
    raw = await fs.readFile(EXCEPTIONS_FILE, 'utf8');
  } catch {
    fail(`Missing required file: ${EXCEPTIONS_FILE}`);
  }

  if (!raw.includes('schema_version:')) {
    fail(`Top-level field 'schema_version' is required in ${EXCEPTIONS_FILE}.`);
  }

  if (!raw.includes('exceptions:')) {
    fail(`Top-level field 'exceptions' is required in ${EXCEPTIONS_FILE}.`);
  }

  const lines = raw.split(/\r?\n/);
  const exceptions = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- id:')) {
      if (current) {
        exceptions.push(current);
      }

      current = {
        id: trimmed.replace(/^- id:\s*/, '').replace(/^"|"$/g, ''),
      };
      continue;
    }

    if (!current) {
      continue;
    }

    if (trimmed.startsWith('team:') && line.includes('owner:') === false) {
      current.ownerTeam = trimmed.replace(/^team:\s*/, '').replace(/^"|"$/g, '');
      continue;
    }

    if (trimmed.startsWith('contact:') && line.includes('owner:') === false) {
      current.ownerContact = trimmed.replace(/^contact:\s*/, '').replace(/^"|"$/g, '');
      continue;
    }

    if (trimmed.startsWith('url:') && line.includes('evidence:') === false) {
      current.evidenceUrl = trimmed.replace(/^url:\s*/, '').replace(/^"|"$/g, '');
      continue;
    }

    if (trimmed.startsWith('expiry:')) {
      current.expiry = trimmed.replace(/^expiry:\s*/, '').replace(/^"|"$/g, '');
      continue;
    }
  }

  if (current) {
    exceptions.push(current);
  }

  if (exceptions.length === 0) {
    fail(`No exception entries found in ${EXCEPTIONS_FILE}.`);
  }

  const now = new Date();

  for (let index = 0; index < exceptions.length; index += 1) {
    const exception = exceptions[index];
    const label = `exceptions[${index}]`;

    for (const field of REQUIRED_EXCEPTION_FIELDS) {
      const hasField =
        field === 'id'
          ? Boolean(exception.id)
          : field === 'owner.team'
            ? Boolean(exception.ownerTeam)
            : field === 'owner.contact'
              ? Boolean(exception.ownerContact)
              : field === 'evidence.url'
                ? Boolean(exception.evidenceUrl)
                : Boolean(exception.expiry);

      if (!hasField) {
        fail(`${label}.${field} is required.`);
      }
    }

    if (typeof exception.id !== 'string' || exception.id.trim().length === 0) {
      fail(`${label}.id must be a non-empty string.`);
    }

    if (!validateIsoDate(exception.expiry)) {
      fail(`${label}.expiry must be an ISO date in format YYYY-MM-DD.`);
    }

    if (isExpired(exception.expiry, now)) {
      fail(`${label}.expiry (${exception.expiry}) is expired.`);
    }
  }

  console.log(`✅ ${EXCEPTIONS_FILE} validation passed (${exceptions.length} exception entries).`);
}

main();
