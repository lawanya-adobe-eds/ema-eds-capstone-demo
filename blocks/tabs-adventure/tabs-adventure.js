import { toClassName } from '../../scripts/aem.js';

/**
 * loads and decorates the tabs-adventure block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventure-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  const buttons = [];

  // activates one tab + its panel, deactivates the rest
  const activate = (button, tabpanel) => {
    block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      panel.setAttribute('aria-hidden', true);
    });
    buttons.forEach((btn) => {
      btn.setAttribute('aria-selected', false);
      btn.setAttribute('tabindex', '-1');
    });
    tabpanel.setAttribute('aria-hidden', false);
    button.setAttribute('aria-selected', true);
    button.setAttribute('tabindex', '0');
  };

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventure-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-adventure-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    // roving tabindex: only the selected tab is in the tab order
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => activate(button, tabpanel));
    buttons.push(button);
    tablist.append(button);
    tab.remove();
  });

  // keyboard navigation (WAI-ARIA tabs pattern): arrows, Home, End
  tablist.addEventListener('keydown', (e) => {
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next === -1) return;
    e.preventDefault();
    const btn = buttons[next];
    btn.focus();
    activate(btn, block.querySelector(`#${btn.getAttribute('aria-controls')}`));
  });

  block.prepend(tablist);
}
