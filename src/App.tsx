import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import { SECTIONS } from './sections';
import { reports } from './data/reports';

export default function App() {
  const [active, setActive] = useState(reports[0]);
  const [section, setSection] = useState('resumen');
  const Section = SECTIONS[section];

  return (
    <Layout reports={reports} active={active} onPickDay={setActive} section={section} onSection={setSection}>
      <AnimatePresence mode="wait">
        <motion.div
          key={section + active.fecha}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Section r={active} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
