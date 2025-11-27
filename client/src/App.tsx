import React, { useEffect, useMemo, useState } from 'react';
import { HealthProfile, RecommendationResponse } from './types';

const initialProfile: HealthProfile = {
  age: '',
  sex: '',
  height_cm: '',
  weight_kg: '',
  blood_pressure: { systolic: '', diastolic: '', measured_at: '' },
  heart_rate: '',
  conditions: [],
  medications: [],
  allergies: [],
  lifestyle: {
    activity_level: 'sedentary',
    steps_per_day: '',
    exercise: { sessions_per_week: '', minutes_per_session: '', types: [] },
    diet_description: '',
    sleep_hours: '',
    sleep_quality: '',
    stress_level: '',
    smoking: '',
    alcohol: '',
  },
  location: { city: '', country: '', latitude: undefined, longitude: undefined },
  work_type: '',
};

const steps = ['Basics', 'Vitals', 'Medical', 'Lifestyle', 'Location', 'Review'];

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

type SectionProps = {
  profile: HealthProfile;
  setProfile: (profile: HealthProfile) => void;
};

const numberValue = (value: number | '' | undefined) => (value === '' || value === undefined ? undefined : Number(value));

const sanitizeProfile = (profile: HealthProfile): HealthProfile => ({
  ...profile,
  age: numberValue(profile.age),
  height_cm: numberValue(profile.height_cm),
  weight_kg: numberValue(profile.weight_kg),
  heart_rate: numberValue(profile.heart_rate),
  blood_pressure: profile.blood_pressure
    ? {
        systolic: numberValue(profile.blood_pressure.systolic) as any,
        diastolic: numberValue(profile.blood_pressure.diastolic) as any,
        measured_at: profile.blood_pressure.measured_at || undefined,
      }
    : undefined,
  lifestyle: profile.lifestyle
    ? {
        ...profile.lifestyle,
        steps_per_day: numberValue(profile.lifestyle.steps_per_day),
        sleep_hours: numberValue(profile.lifestyle.sleep_hours),
        sleep_quality: numberValue(profile.lifestyle.sleep_quality),
        stress_level: numberValue(profile.lifestyle.stress_level),
        exercise: profile.lifestyle.exercise
          ? {
              ...profile.lifestyle.exercise,
              sessions_per_week: numberValue(profile.lifestyle.exercise.sessions_per_week),
              minutes_per_session: numberValue(profile.lifestyle.exercise.minutes_per_session),
            }
          : undefined,
      }
    : undefined,
});

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="card">
    <header className="card-header">
      <h2>{title}</h2>
    </header>
    <div className="card-body">{children}</div>
  </section>
);

const BasicInfoStep: React.FC<SectionProps> = ({ profile, setProfile }) => {
  const bmi = useMemo(() => {
    if (!profile.height_cm || !profile.weight_kg) return null;
    const meters = Number(profile.height_cm) / 100;
    return (Number(profile.weight_kg) / (meters * meters)).toFixed(1);
  }, [profile.height_cm, profile.weight_kg]);

  return (
    <SectionCard title="Basic Information">
      <div className="grid">
        <label>
          Age
          <input
            type="number"
            value={profile.age ?? ''}
            onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : '' })}
            min={0}
          />
        </label>
        <label>
          Sex / Gender
          <select value={profile.sex ?? ''} onChange={(e) => setProfile({ ...profile, sex: e.target.value })}>
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
        </label>
        <label>
          Height (cm)
          <input
            type="number"
            value={profile.height_cm ?? ''}
            onChange={(e) => setProfile({ ...profile, height_cm: e.target.value ? Number(e.target.value) : '' })}
          />
        </label>
        <label>
          Weight (kg)
          <input
            type="number"
            value={profile.weight_kg ?? ''}
            onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value ? Number(e.target.value) : '' })}
          />
        </label>
      </div>
      {bmi && <p className="info">Estimated BMI: {bmi}</p>}
    </SectionCard>
  );
};

const VitalsStep: React.FC<SectionProps> = ({ profile, setProfile }) => (
  <SectionCard title="Vitals">
    <div className="grid">
      <label>
        Systolic
        <input
          type="number"
          value={profile.blood_pressure?.systolic ?? ''}
          onChange={(e) =>
            setProfile({
              ...profile,
              blood_pressure: { ...profile.blood_pressure, systolic: e.target.value ? Number(e.target.value) : '' },
            })
          }
        />
      </label>
      <label>
        Diastolic
        <input
          type="number"
          value={profile.blood_pressure?.diastolic ?? ''}
          onChange={(e) =>
            setProfile({
              ...profile,
              blood_pressure: { ...profile.blood_pressure, diastolic: e.target.value ? Number(e.target.value) : '' },
            })
          }
        />
      </label>
      <label>
        Measured at
        <input
          type="date"
          value={profile.blood_pressure?.measured_at ?? ''}
          onChange={(e) => setProfile({ ...profile, blood_pressure: { ...profile.blood_pressure, measured_at: e.target.value } })}
        />
      </label>
      <label>
        Heart rate (bpm)
        <input
          type="number"
          value={profile.heart_rate ?? ''}
          onChange={(e) => setProfile({ ...profile, heart_rate: e.target.value ? Number(e.target.value) : '' })}
        />
      </label>
    </div>
  </SectionCard>
);

const MedicalStep: React.FC<SectionProps> = ({ profile, setProfile }) => {
  const [conditionsText, setConditionsText] = useState((profile.conditions || []).join(', '));
  const [allergiesText, setAllergiesText] = useState((profile.allergies || []).join(', '));

  useEffect(() => {
    setProfile({ ...profile, conditions: conditionsText ? conditionsText.split(',').map((c) => c.trim()) : [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionsText]);

  useEffect(() => {
    setProfile({ ...profile, allergies: allergiesText ? allergiesText.split(',').map((c) => c.trim()) : [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allergiesText]);

  return (
    <SectionCard title="Medical Background">
      <div className="grid">
        <label className="full">
          Known diseases (comma separated)
          <input value={conditionsText} onChange={(e) => setConditionsText(e.target.value)} placeholder="hypertension, asthma" />
        </label>
        <label className="full">
          Medications
          <textarea
            value={(profile.medications || []).join('\n')}
            onChange={(e) => setProfile({ ...profile, medications: e.target.value.split('\n').filter(Boolean) })}
            placeholder="Drug name + dose + frequency"
          />
        </label>
        <label className="full">
          Allergies
          <input value={allergiesText} onChange={(e) => setAllergiesText(e.target.value)} placeholder="penicillin" />
        </label>
      </div>
    </SectionCard>
  );
};

const LifestyleStep: React.FC<SectionProps> = ({ profile, setProfile }) => (
  <SectionCard title="Lifestyle">
    <div className="grid">
      <label>
        Activity level
        <div className="radio-row">
          {['sedentary', 'light', 'moderate', 'high'].map((value) => (
            <label key={value} className="inline">
              <input
                type="radio"
                name="activity"
                value={value}
                checked={profile.lifestyle?.activity_level === value}
                onChange={() => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, activity_level: value as any } })}
              />
              {value}
            </label>
          ))}
        </div>
      </label>
      <label>
        Steps per day
        <input
          type="number"
          value={profile.lifestyle?.steps_per_day ?? ''}
          onChange={(e) =>
            setProfile({ ...profile, lifestyle: { ...profile.lifestyle, steps_per_day: e.target.value ? Number(e.target.value) : '' } })
          }
        />
      </label>
      <label>
        Exercise sessions/week
        <input
          type="number"
          value={profile.lifestyle?.exercise?.sessions_per_week ?? ''}
          onChange={(e) =>
            setProfile({
              ...profile,
              lifestyle: {
                ...profile.lifestyle,
                exercise: { ...profile.lifestyle?.exercise, sessions_per_week: e.target.value ? Number(e.target.value) : '' },
              },
            })
          }
        />
      </label>
      <label>
        Minutes per session
        <input
          type="number"
          value={profile.lifestyle?.exercise?.minutes_per_session ?? ''}
          onChange={(e) =>
            setProfile({
              ...profile,
              lifestyle: {
                ...profile.lifestyle,
                exercise: { ...profile.lifestyle?.exercise, minutes_per_session: e.target.value ? Number(e.target.value) : '' },
              },
            })
          }
        />
      </label>
      <label className="full">
        Exercise types (comma separated)
        <input
          value={(profile.lifestyle?.exercise?.types || []).join(', ')}
          onChange={(e) =>
            setProfile({
              ...profile,
              lifestyle: {
                ...profile.lifestyle,
                exercise: { ...profile.lifestyle?.exercise, types: e.target.value ? e.target.value.split(',').map((t) => t.trim()) : [] },
              },
            })
          }
        />
      </label>
      <label className="full">
        Diet pattern & notes
        <textarea
          value={profile.lifestyle?.diet_description ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, diet_description: e.target.value } })}
        />
      </label>
      <label>
        Sleep hours/night
        <input
          type="number"
          value={profile.lifestyle?.sleep_hours ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, sleep_hours: e.target.value ? Number(e.target.value) : '' } })}
        />
      </label>
      <label>
        Sleep quality (1-5)
        <input
          type="number"
          min={1}
          max={5}
          value={profile.lifestyle?.sleep_quality ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, sleep_quality: e.target.value ? Number(e.target.value) : '' } })}
        />
      </label>
      <label>
        Stress level (1-5)
        <input
          type="number"
          min={1}
          max={5}
          value={profile.lifestyle?.stress_level ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, stress_level: e.target.value ? Number(e.target.value) : '' } })}
        />
      </label>
      <label>
        Smoking
        <input
          value={profile.lifestyle?.smoking ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, smoking: e.target.value } })}
        />
      </label>
      <label>
        Alcohol
        <input
          value={profile.lifestyle?.alcohol ?? ''}
          onChange={(e) => setProfile({ ...profile, lifestyle: { ...profile.lifestyle, alcohol: e.target.value } })}
        />
      </label>
    </div>
  </SectionCard>
);

const LocationStep: React.FC<SectionProps & { onGeoCapture: () => void }> = ({ profile, setProfile, onGeoCapture }) => (
  <SectionCard title="Location & Context">
    <div className="grid">
      <label>
        City
        <input value={profile.location?.city ?? ''} onChange={(e) => setProfile({ ...profile, location: { ...profile.location, city: e.target.value } })} />
      </label>
      <label>
        Country
        <input
          value={profile.location?.country ?? ''}
          onChange={(e) => setProfile({ ...profile, location: { ...profile.location, country: e.target.value } })}
        />
      </label>
      <label>
        Latitude
        <input
          value={profile.location?.latitude ?? ''}
          onChange={(e) => setProfile({ ...profile, location: { ...profile.location, latitude: e.target.value ? Number(e.target.value) : undefined } })}
        />
      </label>
      <label>
        Longitude
        <input
          value={profile.location?.longitude ?? ''}
          onChange={(e) => setProfile({ ...profile, location: { ...profile.location, longitude: e.target.value ? Number(e.target.value) : undefined } })}
        />
      </label>
      <label className="full">
        Work type
        <input value={profile.work_type ?? ''} onChange={(e) => setProfile({ ...profile, work_type: e.target.value })} />
      </label>
    </div>
    <button className="secondary" type="button" onClick={onGeoCapture}>
      Use browser geolocation
    </button>
    <p className="hint">We only store coordinates locally to tailor suggestions and do not send them unless you submit.</p>
  </SectionCard>
);

const ReviewStep: React.FC<{ profile: HealthProfile; consent: boolean; setConsent: (value: boolean) => void }> = ({ profile, consent, setConsent }) => (
  <SectionCard title="Review & Consent">
    <pre className="summary">{JSON.stringify(profile, null, 2)}</pre>
    <div className="disclaimer">
      <p><strong>Important:</strong> This app does not provide diagnosis or emergency care. If you may be experiencing an emergency, call local services immediately.</p>
      <p>The recommendations are informational and should not replace advice from your clinician.</p>
    </div>
    <label className="checkbox">
      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I understand and agree.
    </label>
  </SectionCard>
);

const RecommendationsPanel: React.FC<{
  response: RecommendationResponse | null;
  onEdit: () => void;
}> = ({ response, onEdit }) => (
  <SectionCard title="Recommendations">
    {!response && <p className="hint">Complete the form to generate evidence-informed guidance.</p>}
    {response && (
      <>
        <p className="timestamp">Generated at {new Date(response.created_at).toLocaleString()}</p>
        <div className="recommendations" dangerouslySetInnerHTML={{ __html: response.recommendations_text.replace(/\n/g, '<br />') }} />
        <button className="secondary" type="button" onClick={onEdit}>
          Update data & regenerate
        </button>
      </>
    )}
  </SectionCard>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile>(initialProfile);
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile({
          ...profile,
          location: { ...profile.location, latitude: Number(pos.coords.latitude.toFixed(4)), longitude: Number(pos.coords.longitude.toFixed(4)) },
        });
      },
      () => setError('Geolocation permission denied. You can enter city and country instead.'),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const goToStep = (offset: number) => {
    setStep((current) => Math.min(Math.max(current + offset, 0), steps.length - 1));
  };

  const submitProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { userId: null, profile: sanitizeProfile(profile) };
      const result = await fetch(`${apiBaseUrl}/assistant/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        const message = await result.text();
        throw new Error(message || 'Request failed');
      }
      const data = (await result.json()) as RecommendationResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must acknowledge the disclaimer before submitting.');
      return;
    }
    submitProfile();
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">DailyLife Health Coach</p>
          <h1>Evidence-based lifestyle guidance for everyday health.</h1>
          <p className="lede">Built to help you reflect on habits, get structured recommendations, and understand when to seek clinical care.</p>
          <div className="cta-row">
            <button onClick={() => setStep(0)}>Start as Guest</button>
            <button className="secondary" type="button">Sign Up / Log In</button>
          </div>
          <p className="disclaimer">Not a medical device. For emergencies, call your local emergency number immediately.</p>
        </div>
      </header>

      <main className="layout">
        <form className="wizard" onSubmit={handleSubmit}>
          <nav className="steps">
            {steps.map((label, index) => (
              <button
                type="button"
                key={label}
                className={index === step ? 'step active' : 'step'}
                onClick={() => setStep(index)}
              >
                {index + 1}. {label}
              </button>
            ))}
          </nav>

          {error && <div className="error">{error}</div>}
          {loading && <div className="loading">Analyzing your data and generating recommendations…</div>}

          {step === 0 && <BasicInfoStep profile={profile} setProfile={setProfile} />}
          {step === 1 && <VitalsStep profile={profile} setProfile={setProfile} />}
          {step === 2 && <MedicalStep profile={profile} setProfile={setProfile} />}
          {step === 3 && <LifestyleStep profile={profile} setProfile={setProfile} />}
          {step === 4 && <LocationStep profile={profile} setProfile={setProfile} onGeoCapture={requestGeo} />}
          {step === 5 && <ReviewStep profile={profile} consent={consent} setConsent={setConsent} />}

          <div className="actions">
            <button type="button" className="secondary" onClick={() => goToStep(-1)} disabled={step === 0}>
              Back
            </button>
            {step < steps.length - 1 && (
              <button type="button" onClick={() => goToStep(1)}>
                Next
              </button>
            )}
            {step === steps.length - 1 && (
              <button type="submit" disabled={loading}>
                Submit
              </button>
            )}
          </div>
        </form>

        <RecommendationsPanel response={response} onEdit={() => setStep(0)} />
      </main>
    </div>
  );
};

export default App;
