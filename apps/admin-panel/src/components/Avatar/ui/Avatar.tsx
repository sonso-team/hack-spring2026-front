import './Avatar.scss';

interface AvatarProps {
  firstName: string;
  lastName: string;
}

export const Avatar = ({ firstName, lastName }: AvatarProps) => (
  <div className="avatar">
    {firstName[0] ?? ''}
    {lastName[0] ?? ''}
  </div>
);
