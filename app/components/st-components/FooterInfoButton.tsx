import type { JSX } from 'react';
import { LuInfo } from 'react-icons/lu';
import { COLORES } from '../render-objetos-st';

interface FooterInfoButtonProps {
  visible: boolean;
  onClick: () => void;
  responsive?: boolean;
}

export default function FooterInfoButton({ visible, onClick, responsive }: FooterInfoButtonProps): JSX.Element | null {
  if (!visible) return null;

  const isResponsive = responsive === true;
  const buttonClassName = isResponsive ? 'flex items-center gap-2 px-6 rounded-xl' : 'flex items-center gap-2 px-8 rounded-xl font-medium';

  return (
    <div
      className="flex justify-center shrink-0 py-2"
      style={{ backgroundColor: COLORES.lastBackground }}
    >
      <button
        className={buttonClassName}
        style={{ backgroundColor: COLORES.primary, borderRadius: 12 }}
        onClick={onClick}
      >
        <LuInfo
          size={isResponsive ? 32 : 62}
          color={COLORES.light}
        />
      </button>
    </div>
  );
}
