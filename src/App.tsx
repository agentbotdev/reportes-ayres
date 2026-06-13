import { useState, useMemo } from 'react';
import Layout from './components/Layout';
import { SECTIONS } from './sections';
import { filterScope, scopeDays } from './lib/metrics';
import { getNarrative } from './data/narrative';

export default function App() {
  const days = useMemo(() => scopeDays(), []);
  const [scope, setScope] = useState('todo');
  const [section, setSection] = useState('resumen');
  const cs = useMemo(() => filterScope(scope), [scope]);
  const nar = getNarrative(scope);
  const Section = SECTIONS[section];

  return (
    <Layout scopes={days} scope={scope} onScope={setScope} section={section} onSection={setSection}>
      <div key={section + scope} className="animate-fade-in">
        <Section cs={cs} nar={nar} scope={scope} />
      </div>
    </Layout>
  );
}
