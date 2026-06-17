import { useState } from 'react'

import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section
        id="center"
        className="flex flex-col grow place-content-center place-items-center gap-[18px] px-5 pt-8 pb-6 lg:gap-[25px] lg:p-0"
      >
        <div className="relative">
          <img
            src={heroImg}
            className="relative z-0 inset-x-0 mx-auto w-[170px]"
            width="170"
            height="179"
            alt=""
          />
          <img
            src={reactLogo}
            className="absolute z-[1] inset-x-0 mx-auto top-[34px] h-[28px] [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute z-0 inset-x-0 mx-auto top-[107px] h-[26px] w-auto [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
            alt="Vite logo"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Get started</h1>
          <p>
            Edit <code className="font-mono">src/App.tsx</code> and save to test{' '}
            <code className="font-mono">HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="text-base px-2.5 py-[5px] rounded-[5px] mb-6 cursor-pointer text-[#646cff] bg-[#f9f9ff] border-2 border-transparent transition-colors duration-300 hover:border-[#646cff] focus-visible:outline-2 focus-visible:outline-[#646cff] focus-visible:outline-offset-2"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="relative w-full before:content-[''] before:absolute before:top-[-4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-[#e2e2e2] after:content-[''] after:absolute after:top-[-4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-[#e2e2e2]"></div>

      <section
        id="next-steps"
        className="flex flex-col text-center border-t border-[#e2e2e2] lg:flex-row lg:text-left"
      >
        <div
          id="docs"
          className="flex-1 px-5 py-6 lg:p-8 border-b border-[#e2e2e2] lg:border-b-0 lg:border-r"
        >
          <svg
            className="mb-4 w-[22px] h-[22px]"
            role="presentation"
            aria-hidden="true"
          >
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 className="text-2xl font-semibold">Documentation</h2>
          <p>Your questions, answered</p>
          <ul className="list-none p-0 flex gap-2 mt-5 flex-wrap justify-center lg:mt-8 lg:flex-nowrap lg:justify-start">
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <img className="h-[18px]" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://react.dev/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <img className="h-[18px] w-[18px]" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social" className="flex-1 px-5 py-6 lg:p-8">
          <svg
            className="mb-4 w-[22px] h-[22px]"
            role="presentation"
            aria-hidden="true"
          >
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2 className="text-2xl font-semibold">Connect with us</h2>
          <p>Join the Vite community</p>
          <ul className="list-none p-0 flex gap-2 mt-5 flex-wrap justify-center lg:mt-8 lg:flex-nowrap lg:justify-start">
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://chat.vite.dev/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://x.com/vite_js"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li className="flex-[1_1_calc(50%-8px)] lg:flex-initial">
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 w-full justify-center box-border lg:w-auto lg:justify-start text-base no-underline rounded-md text-[#1a1a1a] bg-[#f1f1f1] transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="relative w-full before:content-[''] before:absolute before:top-[-4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-[#e2e2e2] after:content-[''] after:absolute after:top-[-4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-[#e2e2e2]"></div>
      <section
        id="spacer"
        className="h-12 border-t border-[#e2e2e2] lg:h-[88px]"
      ></section>
    </>
  )
}

export default App
