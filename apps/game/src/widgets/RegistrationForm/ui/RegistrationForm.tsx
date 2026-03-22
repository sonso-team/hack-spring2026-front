import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { registerPlayer } from '../../../shared/api';
import { useGameStore } from '../../../store/gameStore';
import { FormInput } from '../../../shared/ui/FormInput/FormInput';
import { FormButton } from '../../../shared/ui/FormButton/FormButton';
import './registration-form.scss';

const schema = z.object({
    first_name: z.string().min(1, 'Введите имя').max(50),
    last_name:  z.string().min(1, 'Введите фамилию').max(50),
    phone:      z.string().min(7, 'Введите номер').regex(/^[+\d\s\-()]{7,20}$/, 'Некорректный номер'),
    email:      z.string().email('Некорректный email'),
});

type Fields = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof Fields, string>>;

interface RegistrationFormProps {
    inviteCode: string;
    onSuccess: () => void;
}

export function RegistrationForm ({ inviteCode, onSuccess }: RegistrationFormProps)
{
    const setUser = useGameStore((s) => s.setUser);

    const [fields, setFields] = useState<Fields>({
        first_name: '',
        last_name:  '',
        phone:      '',
        email:      '',
    });
    const [errors, setErrors] = useState<FieldErrors>({});

    const { mutate, isPending, error: apiError } = useMutation({
        mutationFn: () => registerPlayer({ ...fields, invite_code: inviteCode }),
        onSuccess: (data) => {
            setUser(data);
            onSuccess();
        },
    });

    const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields((prev) => ({ ...prev, [key]: e.target.value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('submit fired, fields:', fields);
        const result = schema.safeParse(fields);
        console.log('validation result:', result);
        if (!result.success) {
            const errs: FieldErrors = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0] as keyof Fields;
                if (!errs[key]) errs[key] = issue.message;
            }
            setErrors(errs);
            return;
        }
        console.log('calling mutate...');
        mutate();
    };

    const apiMessage = apiError instanceof Error ? apiError.message : null;

    return (
        <div className="reg-screen">
            <div className="reg-screen__panel">
                <div className="reg-screen__logo">
                    <img src="/assets/logo/logo.svg" alt="DDoS-Guard" />
                </div>

                <h2 className="reg-screen__title">Прежде чем мы начнём…</h2>
                <p className="reg-screen__subtitle">
                    Представься, чтобы мы знали, чьё имя вписать в таблицу лучших защитников.
                </p>

                <form className="reg-screen__form" onSubmit={handleSubmit} noValidate>
                    <div className="reg-screen__field">
                        <label className="reg-screen__label">Имя</label>
                        <FormInput
                            placeholder="Иван"
                            value={fields.first_name}
                            onChange={set('first_name')}
                            aria-invalid={!!errors.first_name || undefined}
                            autoComplete="given-name"
                        />
                        {errors.first_name && <span className="reg-screen__error">{errors.first_name}</span>}
                    </div>

                    <div className="reg-screen__field">
                        <label className="reg-screen__label">Фамилия</label>
                        <FormInput
                            placeholder="Ваня"
                            value={fields.last_name}
                            onChange={set('last_name')}
                            aria-invalid={!!errors.last_name || undefined}
                            autoComplete="family-name"
                        />
                        {errors.last_name && <span className="reg-screen__error">{errors.last_name}</span>}
                    </div>

                    <div className="reg-screen__field">
                        <label className="reg-screen__label">Номер телефона</label>
                        <FormInput
                            placeholder="+7(999) 999-99-99"
                            value={fields.phone}
                            onChange={set('phone')}
                            aria-invalid={!!errors.phone || undefined}
                            inputMode="tel"
                            autoComplete="tel"
                        />
                        {errors.phone && <span className="reg-screen__error">{errors.phone}</span>}
                    </div>

                    <div className="reg-screen__field">
                        <label className="reg-screen__label">Электронная почта</label>
                        <FormInput
                            placeholder="ivanZapara04@gmail.com"
                            value={fields.email}
                            onChange={set('email')}
                            aria-invalid={!!errors.email || undefined}
                            inputMode="email"
                            autoComplete="email"
                        />
                        {errors.email && <span className="reg-screen__error">{errors.email}</span>}
                    </div>

                    {apiMessage && <p className="reg-screen__api-error">{apiMessage}</p>}

                    <FormButton type="submit" fullWidth size="lg" disabled={isPending}>
                        {isPending ? 'Загружаем…' : 'Далее'}
                    </FormButton>
                </form>
            </div>
        </div>
    );
}
