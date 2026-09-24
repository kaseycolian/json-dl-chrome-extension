/* theme-service v1.2.0 — theme-select.js  (GENERATED; theme list mirrors themes.index.json)
   Populates and wires any <select data-theme-select> and any [data-motion-toggle] checkbox.
   Load via <script src="theme/theme-select.js"></script> (NOT inline — MV3/strict CSP blocks inline).
   Markup you provide:  <select data-theme-select aria-label="Theme"></select>
                        <input type="checkbox" data-motion-toggle> Reduce motion  (optional)

   Options are grouped by theme name (<optgroup>), so each row carries only what the
   heading has not said — "Dark", "Dark · No Background". They also carry
   data-dropdown-swatch (the theme's four accents), data-dropdown-secondary (its id)
   and data-dropdown-full-label (the composed "Hot Neon · Dark · No Background", used
   for the closed trigger and type-ahead). A plain <select> ignores all three; add
   data-dropdown AND load dropdown.js to render them.

   For React/Angular, prefer the framework's own provider (see the skill) instead of this file. */
(function () {
  var THEMES = [{"id":"","label":"Auto (Rink Classic)","group":"Automatic","secondary":"follows your OS","swatch":"#ff2ec4,#5bff3a,#3ceaff,#b57fff"},{"id":"rink-classic-dark","label":"Dark","group":"Rink Classic","full":"Rink Classic · Dark","secondary":"rink-classic-dark","swatch":"#ff2ec4,#5bff3a,#3ceaff,#b57fff"},{"id":"rink-classic-dark-no-background","label":"Dark · No Background","group":"Rink Classic","full":"Rink Classic · Dark · No Background","secondary":"rink-classic-dark-no-background","swatch":"#ff2ec4,#5bff3a,#3ceaff,#b57fff"},{"id":"midnight-arcade-dark","label":"Dark","group":"Midnight Arcade","full":"Midnight Arcade · Dark","secondary":"midnight-arcade-dark","swatch":"#f060c4,#54ffc4,#5cc8ff,#a888f5"},{"id":"midnight-arcade-dark-no-background","label":"Dark · No Background","group":"Midnight Arcade","full":"Midnight Arcade · Dark · No Background","secondary":"midnight-arcade-dark-no-background","swatch":"#f060c4,#54ffc4,#5cc8ff,#a888f5"},{"id":"hot-neon-dark","label":"Dark","group":"Hot Neon","full":"Hot Neon · Dark","secondary":"hot-neon-dark","swatch":"#ff3ec8,#6bff45,#22e0ff,#cf7bff"},{"id":"hot-neon-dark-no-background","label":"Dark · No Background","group":"Hot Neon","full":"Hot Neon · Dark · No Background","secondary":"hot-neon-dark-no-background","swatch":"#ff3ec8,#6bff45,#22e0ff,#cf7bff"},{"id":"synthwave-sunset-dark","label":"Dark","group":"Synthwave Sunset","full":"Synthwave Sunset · Dark","secondary":"synthwave-sunset-dark","swatch":"#ff5d8f,#ffb03a,#4ad8ff,#c17bff"},{"id":"acid-arcade-dark","label":"Dark","group":"Acid Arcade","full":"Acid Arcade · Dark","secondary":"acid-arcade-dark","swatch":"#ff4de0,#c6ff2e,#38f0ff,#b98cff"},{"id":"rink-classic-light","label":"Light","group":"Rink Classic","full":"Rink Classic · Light","secondary":"rink-classic-light","swatch":"#b60f86,#1f7d2f,#0a6a9e,#6d28d9"},{"id":"rink-classic-light-no-background","label":"Light · No Background","group":"Rink Classic","full":"Rink Classic · Light · No Background","secondary":"rink-classic-light-no-background","swatch":"#b60f86,#1f7d2f,#0a6a9e,#6d28d9"},{"id":"midnight-arcade-light","label":"Light","group":"Midnight Arcade","full":"Midnight Arcade · Light","secondary":"midnight-arcade-light","swatch":"#b81e7f,#0f7a63,#1257c4,#5b3ad0"},{"id":"midnight-arcade-light-no-background","label":"Light · No Background","group":"Midnight Arcade","full":"Midnight Arcade · Light · No Background","secondary":"midnight-arcade-light-no-background","swatch":"#b81e7f,#0f7a63,#1257c4,#5b3ad0"},{"id":"acid-arcade-light","label":"Light","group":"Acid Arcade","full":"Acid Arcade · Light","secondary":"acid-arcade-light","swatch":"#c01e9c,#5a7a00,#0a7099,#7028d0"},{"id":"acid-arcade-light-no-background","label":"Light · No Background","group":"Acid Arcade","full":"Acid Arcade · Light · No Background","secondary":"acid-arcade-light-no-background","swatch":"#c01e9c,#5a7a00,#0a7099,#7028d0"},{"id":"hot-neon-light","label":"Light","group":"Hot Neon","full":"Hot Neon · Light","secondary":"hot-neon-light","swatch":"#c8127f,#1e7714,#0a72a8,#8b1fd0"},{"id":"synthwave-sunset-light","label":"Light","group":"Synthwave Sunset","full":"Synthwave Sunset · Light","secondary":"synthwave-sunset-light","swatch":"#c81e5c,#9c5000,#0a6f9e,#7d2fc8"}];
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var root = document.documentElement;
    var saved = '';
    try { saved = localStorage.getItem('theme') || ''; } catch (e) {}
    document.querySelectorAll('select[data-theme-select]').forEach(function (sel) {
      if (!sel.options.length) {
        var groups = {};
        THEMES.forEach(function (t) {
          var opt = new Option(t.label, t.id);
          if (t.swatch) opt.setAttribute('data-dropdown-swatch', t.swatch);
          if (t.secondary) opt.setAttribute('data-dropdown-secondary', t.secondary);
          if (t.full) opt.setAttribute('data-dropdown-full-label', t.full);
          if (!t.group) { sel.appendChild(opt); return; }
          if (!groups[t.group]) {
            groups[t.group] = document.createElement('optgroup');
            groups[t.group].label = t.group;
            sel.appendChild(groups[t.group]);
          }
          groups[t.group].appendChild(opt);
        });
      }
      sel.value = root.getAttribute('data-theme') || saved || '';
      sel.addEventListener('change', function () {
        var id = sel.value;
        if (id) { root.setAttribute('data-theme', id); try { localStorage.setItem('theme', id); } catch (e) {} }
        else { root.removeAttribute('data-theme'); try { localStorage.removeItem('theme'); } catch (e) {} }
      });
      // Opt-in upgrade to the accessible listbox. Order-independent: createDropdown
      // is idempotent, so if dropdown.js auto-init already ran on the empty <select>
      // this returns that instance, and rebuild() picks up the options added above.
      // Without data-dropdown nothing changes — apps on the old markup keep the
      // native control through an update.
      if (sel.hasAttribute('data-dropdown') && window.ThemeService && window.ThemeService.createDropdown) {
        var dd = window.ThemeService.createDropdown(sel);
        if (dd) dd.rebuild();
      }
    });
    document.querySelectorAll('[data-motion-toggle]').forEach(function (cb) {
      cb.checked = root.getAttribute('data-motion') === 'off';
      cb.addEventListener('change', function () {
        if (cb.checked) { root.setAttribute('data-motion', 'off'); try { localStorage.setItem('motion', 'off'); } catch (e) {} }
        else { root.removeAttribute('data-motion'); try { localStorage.removeItem('motion'); } catch (e) {} }
      });
    });
  });
})();
