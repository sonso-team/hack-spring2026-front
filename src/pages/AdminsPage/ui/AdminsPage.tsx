import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { createAdmin, deleteAdmin, getAdmins } from '@/api/admins';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminFull } from '@/shared/types';

import './AdminsPage.scss';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  position: '',
  email: '',
  password: '',
};

const Initials = ({ admin }: { admin: AdminFull }) => (
  <div className="admins__avatar">
    {admin.first_name[0]}
    {admin.last_name[0]}
  </div>
);

const AdminRow = ({ admin, onDelete }: { admin: AdminFull; onDelete: (id: number) => void }) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className={`admins__row${confirming ? ' admins__row--confirming' : ''}`}>
      <Initials admin={admin} />

      <div className="admins__info">
        <span className="admins__name">
          {admin.last_name} {admin.first_name}
        </span>
        <span className="admins__position">{admin.position}</span>
      </div>

      <span className={`admins__role admins__role--${admin.role}`}>
        {admin.role === 'superadmin' ? 'Суперадмин' : 'Администратор'}
      </span>

      {admin.role !== 'superadmin' && (
        <div className="admins__actions">
          {confirming ? (
            <>
              <button
                className="admins__btn-confirm"
                onClick={() => {
                  onDelete(admin.id);
                  setConfirming(false);
                }}
              >
                Удалить
              </button>
              <button className="admins__btn-cancel" onClick={() => setConfirming(false)}>
                Отмена
              </button>
            </>
          ) : (
            <button
              className="admins__btn-delete"
              onClick={() => setConfirming(true)}
              title="Удалить администратора"
            >
              <IconTrash />
            </button>
          )}
        </div>
      )}
    </li>
  );
};

const IconTrash = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export const AdminsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: getAdmins,
  });

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setForm(EMPTY_FORM);
      setFormError(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setFormError(err.response?.data?.message ?? 'Ошибка при создании администратора');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
  });

  const handleField =
    (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFormError(null);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setFormError('Заполните обязательные поля');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="admins">
      <div className="admins__inner">
        {/* ── Форма добавления ── */}
        <div className="admins__card">
          <h2 className="admins__card-title">Новый администратор</h2>

          <form className="admins__form" onSubmit={handleSubmit} noValidate>
            <div className="admins__row-fields">
              <div className="admins__field">
                <label className="admins__label">Фамилия *</label>
                <Input
                  placeholder="Иванов"
                  value={form.last_name}
                  onChange={handleField('last_name')}
                  aria-invalid={!!formError}
                />
              </div>
              <div className="admins__field">
                <label className="admins__label">Имя *</label>
                <Input
                  placeholder="Иван"
                  value={form.first_name}
                  onChange={handleField('first_name')}
                  aria-invalid={!!formError}
                />
              </div>
            </div>

            <div className="admins__field">
              <label className="admins__label">Должность</label>
              <Input
                placeholder="DevRel"
                value={form.position}
                onChange={handleField('position')}
              />
            </div>

            <div className="admins__field">
              <label className="admins__label">Почта *</label>
              <Input
                type="email"
                placeholder="admin@ddos-guard.net"
                value={form.email}
                onChange={handleField('email')}
                aria-invalid={!!formError}
              />
            </div>

            <div className="admins__field">
              <label className="admins__label">Пароль *</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleField('password')}
                aria-invalid={!!formError}
              />
            </div>

            {formError && <p className="admins__form-error">{formError}</p>}

            <Button type="submit" fullWidth disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Добавляем...' : 'Добавить администратора'}
            </Button>
          </form>
        </div>

        {/* ── Список администраторов ── */}
        <div className="admins__card admins__card--list">
          <div className="admins__list-header">
            <h2 className="admins__card-title">Администраторы</h2>
            {admins.length > 0 && <span className="admins__count">{admins.length}</span>}
          </div>

          {isLoading ? (
            <p className="admins__empty">Загрузка...</p>
          ) : admins.length === 0 ? (
            <p className="admins__empty">Администраторы не добавлены</p>
          ) : (
            <ul className="admins__list" role="list">
              {admins.map((admin) => (
                <AdminRow
                  key={admin.id}
                  admin={admin}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
