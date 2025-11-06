import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import axios from 'axios'
import Login from '../pages/Login.vue'

// Mock dependencies
vi.mock('axios')
vi.mock('aos', () => ({
    default: {
        init: vi.fn()
    }
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}))

vi.mock('@fortawesome/vue-fontawesome', () => ({
    FontAwesomeIcon: {
        name: 'FontAwesomeIcon',
        template: '<i></i>'
    }
}))

vi.mock('@fortawesome/fontawesome-svg-core', () => ({
    library: {
        add: vi.fn()
    }
}))

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
    faUser: {},
    faLock: {},
    faEye: {},
    faEyeSlash: {}
}))

describe('Login Component', () => {
    let wrapper
    let mockRouter
    const mockedAxios = vi.mocked(axios)

    beforeEach(() => {
        mockRouter = { push: vi.fn() }
        vi.clearAllMocks()
        localStorage.clear()
        
        wrapper = mount(Login, {
            global: {
                mocks: {
                    $router: mockRouter
                },
                stubs: {
                    'router-link': true,
                    FontAwesomeIcon: true
                }
            }
        })
    })

    afterEach(() => {
        wrapper.unmount()
    })

    describe('Component Rendering', () => {
        it('renders login form correctly', () => {
            expect(wrapper.find('form').exists()).toBe(true)
            expect(wrapper.find('input[type="email"]').exists()).toBe(true)
            expect(wrapper.find('input[type="password"]').exists()).toBe(true)
            expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
        })

        it('displays welcome message and form title', () => {
            expect(wrapper.text()).toContain('Welcome Back')
            expect(wrapper.text()).toContain('Sign in to your account to continue')
        })

        it('displays email and password labels', () => {
            expect(wrapper.text()).toContain('Email Address')
            expect(wrapper.text()).toContain('Password')
        })

        it('displays sign up link', () => {
            expect(wrapper.text()).toContain("Don't have an account?")
            expect(wrapper.text()).toContain('Create one')
        })
    })

    describe('Form Input Handling', () => {
        it('updates email value when input changes', async () => {
            const emailInput = wrapper.find('input[type="email"]')
            await emailInput.setValue('test@example.com')
            
            expect(wrapper.vm.loginData.email).toBe('test@example.com')
        })

        it('updates password value when input changes', async () => {
            const passwordInput = wrapper.find('input[type="password"]')
            await passwordInput.setValue('password123')
            
            expect(wrapper.vm.loginData.password).toBe('password123')
        })

        it('has required attributes on form inputs', () => {
            const emailInput = wrapper.find('input[type="email"]')
            const passwordInput = wrapper.find('input[type="password"]')
            
            expect(emailInput.attributes('required')).toBeDefined()
            expect(passwordInput.attributes('required')).toBeDefined()
        })
    })

    describe('Password Visibility Toggle', () => {
        it('toggles password visibility when eye icon is clicked', async () => {
            const toggleButton = wrapper.find('button[type="button"]')
            const passwordInput = wrapper.find('input')
            
            expect(wrapper.vm.showPassword).toBe(false)
            expect(passwordInput.attributes('type')).toBe('password')
            
            await toggleButton.trigger('click')
            
            expect(wrapper.vm.showPassword).toBe(true)
            expect(passwordInput.attributes('type')).toBe('text')
        })

        it('starts with password hidden by default', () => {
            expect(wrapper.vm.showPassword).toBe(false)
        })
    })

    describe('Form Submission', () => {
        beforeEach(async () => {
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('input[type="password"]').setValue('password123')
        })

        it('calls submitFormData when form is submitted', async () => {
            const submitSpy = vi.spyOn(wrapper.vm, 'submitFormData')
            
            await wrapper.find('form').trigger('submit.prevent')
            
            expect(submitSpy).toHaveBeenCalled()
        })

        it('shows loading state during form submission', async () => {
            mockedAxios.post.mockImplementation(() => new Promise(() => {}))
            
            const submitButton = wrapper.find('button[type="submit"]')
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.vm.isLoading).toBe(true)
            expect(submitButton.attributes('disabled')).toBeDefined()
            expect(wrapper.text()).toContain('Signing In...')
        })

        it('makes API call with correct credentials', async () => {
            mockedAxios.post.mockResolvedValue({
                data: { token: 'fake-token' }
            })
            
            await wrapper.find('form').trigger('submit.prevent')
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:8000/auth/login',
                {
                    email: 'test@example.com',
                    password: 'password123'
                }
            )
        })
    })

    describe('Successful Login', () => {
        beforeEach(async () => {
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('input[type="password"]').setValue('password123')
        })

        it('handles successful login response', async () => {
            const mockToken = 'fake-jwt-token'
            mockedAxios.post.mockResolvedValue({
                data: { token: mockToken }
            })
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.vm.successMessage).toBe('Login successful!')
            expect(localStorage.getItem('token')).toBe(mockToken)
            expect(mockRouter.push).toHaveBeenCalledWith({ name: 'Dashboard' })
        })

        it('displays success message', async () => {
            mockedAxios.post.mockResolvedValue({
                data: { token: 'fake-token' }
            })
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.find('.bg-emerald-500').exists()).toBe(true)
            expect(wrapper.text()).toContain('Login successful!')
        })

        it('clears loading state after successful login', async () => {
            mockedAxios.post.mockResolvedValue({
                data: { token: 'fake-token' }
            })
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.vm.isLoading).toBe(false)
        })
    })

    describe('Failed Login', () => {
        beforeEach(async () => {
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('input[type="password"]').setValue('wrongpassword')
        })

        it('handles login error', async () => {
            mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'))
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.vm.errorMessage).toBe('Invalid credentials. Please try again.')
            expect(localStorage.getItem('token')).toBeNull()
            expect(mockRouter.push).not.toHaveBeenCalled()
        })

        it('displays error message', async () => {
            mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'))
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.find('.bg-red-500').exists()).toBe(true)
            expect(wrapper.text()).toContain('Invalid credentials. Please try again.')
        })

        it('clears loading state after failed login', async () => {
            mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'))
            
            await wrapper.find('form').trigger('submit.prevent')
            await nextTick()
            
            expect(wrapper.vm.isLoading).toBe(false)
        })
    })

    describe('Message Auto-Clear', () => {
        it('automatically clears success message after 5 seconds', async () => {
            vi.useFakeTimers()
            
            wrapper.vm.successMessage = 'Login successful!'
            wrapper.vm.resetSuccessMessage()
            
            expect(wrapper.vm.successMessage).toBe('Login successful!')
            
            vi.advanceTimersByTime(5000)
            
            expect(wrapper.vm.successMessage).toBe('')
            
            vi.useRealTimers()
        })

        it('automatically clears error message after 3 seconds', async () => {
            vi.useFakeTimers()
            
            wrapper.vm.errorMessage = 'Invalid credentials'
            wrapper.vm.resetErrorMessage()
            
            expect(wrapper.vm.errorMessage).toBe('Invalid credentials')
            
            vi.advanceTimersByTime(3000)
            
            expect(wrapper.vm.errorMessage).toBe('')
            
            vi.useRealTimers()
        })
    })

    describe('Component Lifecycle', () => {
        it('initializes AOS on mount', async () => {
            const AOS = await import('aos')
            expect(AOS.default.init).toHaveBeenCalled()
        })
    })

    describe('Accessibility', () => {
        it('has proper form labels associated with inputs', () => {
            const emailInput = wrapper.find('#email')
            const passwordInput = wrapper.find('#password')
            const emailLabel = wrapper.find('label[for="email"]')
            const passwordLabel = wrapper.find('label[for="password"]')
            
            expect(emailInput.exists()).toBe(true)
            expect(passwordInput.exists()).toBe(true)
            expect(emailLabel.exists()).toBe(true)
            expect(passwordLabel.exists()).toBe(true)
        })

        it('has proper input placeholders', () => {
            const emailInput = wrapper.find('input[type="email"]')
            const passwordInput = wrapper.find('input[type="password"]')
            
            expect(emailInput.attributes('placeholder')).toBe('Enter your email')
            expect(passwordInput.attributes('placeholder')).toBe('Enter your password')
        })
    })
})
