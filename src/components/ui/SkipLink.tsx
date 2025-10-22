/**
 * Skip to main content link for accessibility
 * WCAG 2.2 AA requirement
 */

import { useTranslation } from 'react-i18next';
import { SKIP_LINK_CLASSES } from '../../lib/constants';

export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a href="#main-content" className={SKIP_LINK_CLASSES}>
      {t('a11y.skipToMain')}
    </a>
  );
}

