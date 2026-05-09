'use client';

import { useState } from 'react';

import axios from 'axios';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  async function login() {
    try {
      const response =
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            email,
            password,
          },
        );

      localStorage.setItem(
        'token',
        response.data.access_token,
      );

      router.push('/dashboard');
    } catch {
      alert(
        'Invalid credentials',
      );
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value,
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-xl"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value,
              )
            }
          />

          <button
            onClick={login}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}