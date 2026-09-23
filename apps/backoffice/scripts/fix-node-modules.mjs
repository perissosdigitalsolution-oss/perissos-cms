import fs from 'fs';
import path from 'path';

function link(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const st = fs.lstatSync(s);
    if (st.isSymbolicLink()) {
      const t = fs.readlinkSync(s);
      const r = path.resolve(path.dirname(s), t);
      if (fs.existsSync(r)) {
        const rs = fs.statSync(r);
        if (rs.isDirectory()) link(r, d);
        else fs.copyFileSync(r, d);
      }
    } else if (st.isDirectory()) {
      link(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

link('/app/node_modules/.pnpm', '/app/node_modules');