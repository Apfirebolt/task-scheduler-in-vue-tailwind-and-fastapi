import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../pages/Home.vue'

describe('Home.vue', () => {
    it('renders welcome message', () => {
        const wrapper = mount(Home)
        expect(wrapper.find('p').text()).toBe('Welcome!')
    })

    it('renders description text', () => {
        const wrapper = mount(Home)
        const paragraphs = wrapper.findAll('p')
        expect(paragraphs[1].text()).toBe('Vue and Tailwind CSS in action')
    })

    it('has correct CSS classes on container', () => {
        const wrapper = mount(Home)
        const container = wrapper.find('div')
        expect(container.classes()).toContain('container')
        expect(container.classes()).toContain('grow')
        expect(container.classes()).toContain('mx-auto')
        expect(container.classes()).toContain('bg-gray-200')
    })

    it('applies correct styling to welcome text', () => {
        const wrapper = mount(Home)
        const welcomeText = wrapper.find('p')
        expect(welcomeText.classes()).toContain('text-3xl')
        expect(welcomeText.classes()).toContain('text-gray-700')
        expect(welcomeText.classes()).toContain('font-bold')
    })

    it('applies correct styling to description text', () => {
        const wrapper = mount(Home)
        const descriptionText = wrapper.findAll('p')[1]
        expect(descriptionText.classes()).toContain('text-gray-500')
        expect(descriptionText.classes()).toContain('text-lg')
    })

    it('renders exactly two paragraphs', () => {
        const wrapper = mount(Home)
        expect(wrapper.findAll('p')).toHaveLength(2)
    })
})