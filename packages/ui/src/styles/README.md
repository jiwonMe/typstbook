# DialKit styles

`dialkit.css` is the MIT-licensed stylesheet from `dialkit@2.0.0/dist/styles.css`,
with only the Google Fonts import removed. `dialkit-LICENSE.txt` retains its license.
When upgrading DialKit, refresh this file from the same installed version and
remove the remote font import again.

`index.css` maps DialKit variables to SEED semantic tokens and uses the bundled
Pretendard font. Controls are imported from the actual `dialkit` React package
and bound directly to workbench arguments, so URL restoration, reset, recompiles,
and docking share one source of truth. No DialKit panel store or persistence is
needed. Static sites display labeled read-only values.
