import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Loader from '@/components/Loader.vue'

describe('Loader Component', () => {
  it('renders the component correctly', () => {
    const wrapper = mount(Loader)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays loading text', () => {
    const wrapper = mount(Loader)
    const loadingText = wrapper.find('p')
    expect(loadingText.text()).toBe('Loading ...')
  })

  it('applies correct CSS classes for centering', () => {
    const wrapper = mount(Loader)
    const container = wrapper.find('div')

    expect(container.classes()).toContain('absolute')
    expect(container.classes()).toContain('top-1/2')
    expect(container.classes()).toContain('left-1/2')
    expect(container.classes()).toContain('transform')
    expect(container.classes()).toContain('-translate-x-1/2')
    expect(container.classes()).toContain('-translate-y-1/2')
  })

  it('applies correct text styling', () => {
    const wrapper = mount(Loader)
    const loadingText = wrapper.find('p')

    expect(loadingText.classes()).toContain('text-4xl')
    expect(loadingText.classes()).toContain('text-bold')
  })

  it('has simple template structure', () => {
    const wrapper = mount(Loader)
    expect(wrapper.html()).toContain('<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">')
    expect(wrapper.html()).toContain('<p class="text-4xl text-bold">Loading ...</p>')
  })
})