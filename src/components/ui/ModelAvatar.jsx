import clsx from 'clsx';
import darkProfile from '../../../images/dark_profile.png';

const SIZE_CLASS = {
  sm: 'model-avatar--sm',
  chat: 'model-avatar--chat',
  md: 'model-avatar--md',
  lg: 'model-avatar--lg',
};

export default function ModelAvatar({
  size,
  sizePreset = 'md',
  className,
  alt = 'DocMind assistant',
}) {
  const presetClass = size == null ? SIZE_CLASS[sizePreset] ?? SIZE_CLASS.md : null;

  return (
    <span
      className={clsx('model-avatar', presetClass, className)}
      style={size != null ? { width: size, height: size } : undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img src={darkProfile} alt={alt} className="model-avatar__img" draggable={false} />
    </span>
  );
}
