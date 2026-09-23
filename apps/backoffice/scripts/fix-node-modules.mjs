import fs from 'fs';
import path from 'path';

function copyDir(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const stat = fs.lstatSync(s);
    if (stat.isSymbolicLink()) {
      const t = fs.readlinkSync(s);
      const r = path.resolve(path.dirname(s), t);
      if (fs.existsSync(r)) {
        const rs = fs.statSync(r);
        if (rs.isDirectory()) copyDir(r, d);
        else fs.copyFileSync(r, d);
      }
    } else if (stat.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
copyDir('/app/node_modules', '/app/apps/backoffice/node_modules');
