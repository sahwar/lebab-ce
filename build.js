import axios from 'axios';
import consola from 'consola';
import { Nuxt, Builder, Generator } from 'nuxt';
import nuxtOpts from './nuxt.config';
import fs from 'fs';
nuxtOpts.dev = false;
const getLebab = async () => {
  const { data: { message: msg } } = await axios.get('https://umdfied.herokuapp.com/umdfied/lebab/latest');
  if (!msg || !msg.url || !msg.semver) {
    throw new Error('Could not fetch lebab');
  }
  return msg;
};
const build = async () => {
  const { url, semver } = await getLebab();
  nuxtOpts.env = Object.assign(nuxtOpts.env || {}, { lebab: semver });
  nuxtOpts.head.link.push({ href: url, rel: 'preload', as: 'script' });
  nuxtOpts.head.script.push({ src: url, type: 'text/javascript', body: true });
  console.log(nuxtOpts.head);
  const nuxt = new Nuxt(nuxtOpts);
  nuxt.hook('generate:page', (ctx) => {
    const r = /(\.css" rel="preload" as=")(script)/gm;
    ctx.html = ctx.html.replace(r, '$1style');
    return ctx;
  });
  const builder = new Builder(nuxt);
  const generator = new Generator(nuxt, builder);
  await generator.generate({ init: true, build: true });
};
build()
  .then(() => {
    fs.writeFileSync('docs/CNAME', 'lebab.unibtc.me');
  })
  .catch(error => consola.fatal(error));
