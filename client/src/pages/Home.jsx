import { Icon } from '../components/Icon.jsx'
import  company  from '../assets/images/company.png';
import dash from '../assets/images/dash.png'
import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";



export function Home() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      setUser(firebaseUser);

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("http://localhost:8000/api/users/login", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="home-container">
        <div className="home-loading">Loading...</div>
      </div>
    );
  }
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 pb-24 pt-12 lg:pb-32 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <span className="mb-6 inline-block rounded-full bg-blue-600/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                Connecting Minds
              </span>
              <h1 className="mb-8 text-5xl font-black leading-tight tracking-tight lg:text-7xl">
                Empowering Students &amp; Mentors —{' '}
                <span className="text-blue-600">All in One Hub</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400 lg:mx-0 lg:text-xl">
                A unified platform for collaboration, mentorship, and academic
                growth. Join the future of education today with integrated tools
                designed for success.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <button className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/35 transition-transform hover:scale-105">
                  Get Started Free
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <Icon name="play_circle" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1">
              <div className="absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border-8 border-white shadow-2xl dark:border-slate-800">
                <img
                  className="h-full w-full object-cover"
                  alt="Group of diverse students collaborating around a laptop"
                  src={company}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: '50K+', label: 'Active Students' },
              { value: '1.2K+', label: 'Expert Mentors' },
              { value: '200+', label: 'Partner Colleges' },
              { value: '98%', label: 'Success Rate' },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl border-b-4 border-b-blue-600 p-8 text-center"
              >
                <p className="mb-2 text-4xl font-black text-blue-600">
                  {s.value}
                </p>
                <p className="font-medium text-slate-600 dark:text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-slate-50 py-24 text-center dark:bg-slate-950"
        id="features"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-black lg:text-5xl">
            Powerful Features for Everyone
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Designed to bridge the gap between learning and professional
            guidance with modern tools.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: 'psychology',
                title: 'Smart Matching',
                text: 'Our AI-powered engine connects you with mentors based on your unique career goals and learning style.',
              },
              {
                icon: 'library_books',
                title: 'Resource Library',
                text: 'Access thousands of curated study materials, industry reports, and proprietary learning paths.',
              },
              {
                icon: 'video_camera_front',
                title: 'Live Workshops',
                text: 'Join weekly interactive sessions with industry experts and faculty from top-tier global institutions.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon name={f.icon} />
                </div>
                <h3 className="mb-4 text-xl font-bold">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-24 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="lg:w-1/2">
              <h2 className="mb-12 text-4xl font-black">
                Tailored Experience for Your Role
              </h2>
              <div className="space-y-6">
                <div className="glass cursor-default rounded-2xl p-6 transition-all">
                  <div className="flex gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-lg shadow-primary/20">
                      01
                    </div>
                    <div>
                      <h4 className="mb-2 text-xl font-bold">For Students</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Track progress, join peer groups, and find mentors to
                        accelerate your professional journey.
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  {
                    n: '02',
                    title: 'For Mentors',
                    text: 'Manage mentees, schedule sessions, and share insights through our dedicated dashboard.',
                  },
                  {
                    n: '03',
                    title: 'For Colleges',
                    text: 'Monitor student performance and industry engagement metrics at an institutional level.',
                  },
                ].map((r) => (
                  <div
                    key={r.n}
                    className="cursor-default rounded-2xl bg-slate-50 p-6 transition-all hover:glass dark:bg-slate-800/50"
                  >
                    <div className="flex gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {r.n}
                      </div>
                      <div>
                        <h4 className="mb-2 text-xl font-bold">{r.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {r.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:w-1/2">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-2xl">
                <div className="rounded-[1.4rem] bg-white p-4 dark:bg-slate-900 lg:p-8">
                  <img
                    className="rounded-xl shadow-inner"
                    alt="Digital dashboard showing student analytics and progress charts"
                    src={dash}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-slate-50 py-24 dark:bg-slate-950"
        id="testimonials"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black lg:text-5xl">
              Trusted by Thousands
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Hear from our community of learners and mentors.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  '"EduHub completely changed how I look for career guidance. The mentor I was matched with helped me land my dream internship at Google."',
                name: 'Sarah Jenkins',
                role: 'CS Student, Stanford',
                avatar:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBnicVX61jfzFAoyB9BSPYAc7y5K-aF-G5cjEOVBiJ55rdp6sLYQ27aYl7oojP8uiIv2vZvBvancx1p_gSsLsWSAW9J928BmQ-GRlgsHVL14lQwp8zrLBnqiQ8y972GIxESrxMpsc639dleo7Zg40DHTDCwbO9ZSd7x-RXFpO0VHOlUu5cVx6aNlJcgsc5-MX5V17e_sIimOD2iahZUivHgwezgr8wwd_jpRkGfKNIA7IZmwbLv2P0Vo-HPX-9yiEbgq-xt2-IdIq0',
              },
              {
                quote:
                  '"The platform is incredibly intuitive. As a mentor, I can easily manage my schedule and track the progress of all my mentees in one place."',
                name: 'David Chen',
                role: 'Sr. Product Designer',
                avatar:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ8vvXZ7XU4LFgb9kxn2fzqf7jRXgxVY2eyJt-eCNCPozylJ36S4L_Q75wQcfbjw0Fkp4JI7Cnp6rp6K_CaUCW5dDg3HEh5OWF7VVnsufZSEphl1SZpEaDHBskRyEidMmLHu3s9lQ5hVIiOrBA6TA4zscla4qGZB6HuHPGQebJFoBL3QiOLDEJFOzTsnJYjt44z1GKcVhPBYrqsz44RFiltoJGQ7m_nSvYiyK6t_aEOdqtXjQvrD0llGo1-srQUgOwnjul6yUvNBg',
              },
              {
                quote:
                  '"Implementing EduHub across our campus has boosted student engagement by 45%. The analytics dashboard is a game changer."',
                name: 'Dr. Elena Rodriguez',
                role: 'Dean of Students, NYU',
                avatar:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDMqg3wZpGJ8mHdpj6TUhFdIwdSHO8sSX2mj0Baxxhx7VOVzBvzaSipxYbKKqh8Al1MoHEmpMsWI2ogT7YkaQvF4igzj2qepniolHvkYtRoo9fl6f1tkTzpdJzwb6MTRUZ0wykoqD8ezIF-erhrCC6agXyqiQonDXMOHzxIECdMfylonuTJFOxFbw-ea-zrswQAQdDVfcYwGhprccT6guLCwyZC5agBhasgt9EkW2SebmZ_eUTDzb-8SW1evNO1gr8VUgrbosog6yQ',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="relative rounded-2xl bg-white p-8 italic shadow-sm dark:bg-slate-800"
              >
                <Icon
                  name="format_quote"
                  className="absolute left-4 top-4 text-6xl text-blue-600/20"
                />
                <p className="relative z-10 mb-8 leading-relaxed text-slate-700 dark:text-slate-300">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    alt={`${t.name} avatar`}
                    src={t.avatar}
                  />
                  <div>
                    <p className="font-bold not-italic">{t.name}</p>
                    <p className="text-sm text-slate-500 not-italic">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] bg-gradient-to-r from-blue-700 to-blue-500 p-12 text-center shadow-2xl shadow-blue-700/25 lg:p-20">
          <div className="absolute right-0 top-0 h-64 w-64 -mr-32 -mt-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -mb-32 -ml-32 rounded-full bg-black/10 blur-3xl" />
          <h2 className="relative z-10 mb-8 text-3xl font-black text-white lg:text-5xl">
            Ready to start your journey?
          </h2>
          <p className="relative z-10 mx-auto mb-12 max-w-xl text-lg text-white/80">
            Join 50,000+ students and world-class mentors today. Your future self
            will thank you.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-2xl bg-white px-10 py-4 text-lg font-black text-blue-700 transition-transform hover:scale-105">
              Get Started Now
            </button>
            <button className="rounded-2xl border-2 border-white/30 bg-transparent px-10 py-4 text-lg font-black text-white transition-colors hover:bg-white/10">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white pb-10 pt-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="mb-6 flex items-center gap-2">
                <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                  <Icon name="school" className="block text-xl" />
                </div>
                <span className="text-xl font-black text-blue-600">EduHub</span>
              </div>
              <p className="mb-6 max-w-xs text-slate-500">
                Empowering the next generation of professionals through seamless
                mentorship and collaborative learning.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: 'public', label: 'Website' },
                  { icon: 'share', label: 'Share' },
                  { icon: 'mail', label: 'Email' },
                ].map((x) => (
                  <a
                    key={x.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"
                    href="#"
                    aria-label={x.label}
                  >
                    <Icon name={x.icon} className="text-xl" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Platform',
                links: ['Browse Mentors', 'Colleges', 'Resources', 'Pricing'],
              },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
              {
                title: 'Support',
                links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'],
              },
            ].map((c) => (
              <div key={c.title}>
                <h5 className="mb-6 font-bold">{c.title}</h5>
                <ul className="space-y-4 text-slate-500">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a className="transition-colors hover:text-blue-600" href="#">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row dark:border-slate-800">
            <p className="text-sm text-slate-500">
              © 2024 EduHub Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Icon name="location_on" className="text-sm" />
              <span>Global Headquaters: New York</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home;
