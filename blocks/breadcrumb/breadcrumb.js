/**
 * Breadcrumb block.
 *
 * Content model (authored as rows, one crumb per row):
 *   <div class="breadcrumb">
 *     <div><div><a href="/us/en/adventures">Adventures</a></div></div>
 *     <div><div>Bali Surf Camp</div></div>
 *   </div>
 *
 * Also supports a single-list model where each <li> is a crumb.
 *
 *   - Crumbs with a link render as anchors.
 *   - The final crumb is the current page: rendered as active, non-linked text.
 *
 * loads and decorates the breadcrumb
 * @param {Element} block The breadcrumb block element
 */
export default async function decorate(block) {
  // Prefer an authored list; otherwise treat each block row as one crumb.
  let items = [...block.querySelectorAll('li')];
  if (!items.length) {
    items = [...block.children];
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  list.className = 'breadcrumb-list';

  items.forEach((item, idx) => {
    const link = item.querySelector('a');
    const label = (link ? link.textContent : item.textContent).trim();
    if (!label) return;

    const li = document.createElement('li');
    li.className = 'breadcrumb-item';

    const isLast = idx === items.length - 1;
    if (link && !isLast) {
      const a = document.createElement('a');
      a.className = 'breadcrumb-link';
      a.href = link.getAttribute('href');
      a.textContent = label;
      li.append(a);
    } else {
      // Current page (or a crumb with no link): render as active text.
      li.classList.add('breadcrumb-item-active');
      li.setAttribute('aria-current', 'page');
      const span = document.createElement('span');
      span.textContent = label;
      li.append(span);
    }

    list.append(li);
  });

  nav.append(list);
  block.textContent = '';
  block.append(nav);
}
