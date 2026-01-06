import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewHistory from './ReviewHistory.vue';

describe('ReviewHistory.vue', () => {
    const mockHistory = [
        {
            id: '1',
            code: 'def test(): pass',
            language: 'python',
            focus: 'security',
            summary: 'SQL injection vulnerability found',
            score: 45,
            createdAt: '2026-01-06T10:00:00Z'
        },
        {
            id: '2',
            code: 'function test() {}',
            language: 'javascript',
            focus: 'performance',
            summary: 'Code is well optimized',
            score: 92,
            createdAt: '2026-01-06T11:00:00Z'
        },
        {
            id: '3',
            code: 'public void test() {}',
            language: 'java',
            focus: 'readability',
            summary: 'Good naming conventions',
            score: 78,
            createdAt: '2026-01-06T12:00:00Z'
        }
    ];

    it('renders history header', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [],
                loading: false
            }
        });

        expect(wrapper.text()).toContain('History');
    });

    it('displays loading spinner when loading and history is empty', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [],
                loading: true
            }
        });

        const spinner = wrapper.find('.animate-spin');
        expect(spinner.exists()).toBe(true);
    });

    it('displays "No recent activity" when history is empty', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [],
                loading: false
            }
        });

        expect(wrapper.text()).toContain('No recent activity');
    });

    it('renders all history items', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: mockHistory,
                loading: false
            }
        });

        const items = wrapper.findAll('button').filter(btn =>
            btn.classes().includes('w-full')
        );
        expect(items.length).toBe(3);
    });

    it('displays correct information for each history item', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[0]],
                loading: false
            }
        });

        const item = wrapper.find('button.w-full');
        expect(item.text()).toContain('security');
        expect(item.text()).toContain('SQL injection vulnerability found');
        expect(item.text()).toContain('python');
        expect(item.text()).toContain('45%');
    });

    it('emits select event when history item is clicked', async () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: mockHistory,
                loading: false
            }
        });

        const firstItem = wrapper.findAll('button').filter(btn =>
            btn.classes().includes('w-full')
        )[0];

        await firstItem.trigger('click');

        expect(wrapper.emitted('select')).toBeTruthy();
        expect(wrapper.emitted('select')![0]).toEqual([mockHistory[0]]);
    });

    it('shows Clear All button when history has items', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: mockHistory,
                loading: false
            }
        });

        const clearBtn = wrapper.findAll('button').find(btn =>
            btn.text() === 'Clear All'
        );
        expect(clearBtn).toBeDefined();
    });

    it('hides Clear All button when history is empty', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [],
                loading: false
            }
        });

        const clearBtn = wrapper.findAll('button').find(btn =>
            btn.text() === 'Clear All'
        );
        expect(clearBtn).toBeUndefined();
    });

    it('emits clear event when Clear All is clicked', async () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: mockHistory,
                loading: false
            }
        });

        const clearBtn = wrapper.findAll('button').find(btn =>
            btn.text() === 'Clear All'
        );

        await clearBtn!.trigger('click');

        expect(wrapper.emitted('clear')).toBeTruthy();
    });

    it('displays correct score color for high scores', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[1]], // score: 92
                loading: false
            }
        });

        const scoreElement = wrapper.find('.text-green-400');
        expect(scoreElement.exists()).toBe(true);
        expect(scoreElement.text()).toContain('92%');
    });

    it('displays correct score color for medium scores', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[2]], // score: 78
                loading: false
            }
        });

        const scoreElement = wrapper.find('.text-yellow-400');
        expect(scoreElement.exists()).toBe(true);
        expect(scoreElement.text()).toContain('78%');
    });

    it('displays correct score color for low scores', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[0]], // score: 45
                loading: false
            }
        });

        const scoreElement = wrapper.find('.text-red-400');
        expect(scoreElement.exists()).toBe(true);
        expect(scoreElement.text()).toContain('45%');
    });

    it('formats date correctly', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[0]],
                loading: false
            }
        });

        // Check that date is formatted (exact format depends on locale)
        const dateText = wrapper.find('.text-\\[10px\\]').text();
        expect(dateText).toBeTruthy();
        expect(dateText.length).toBeGreaterThan(0);
    });

    it('displays focus mode in uppercase', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: mockHistory,
                loading: false
            }
        });

        const focusBadges = wrapper.findAll('.text-blue-400.uppercase');
        expect(focusBadges.length).toBe(3);
        // The text content is lowercase, but CSS transforms it to uppercase
        expect(focusBadges[0].text()).toBe('security');
        expect(focusBadges[1].text()).toBe('performance');
        expect(focusBadges[2].text()).toBe('readability');
    });

    it('truncates long summaries with line-clamp', () => {
        const longSummary = 'This is a very long summary that should be truncated because it exceeds the maximum length allowed for display in the history panel';

        const wrapper = mount(ReviewHistory, {
            props: {
                history: [{
                    ...mockHistory[0],
                    summary: longSummary
                }],
                loading: false
            }
        });

        const summaryElement = wrapper.find('.line-clamp-1');
        expect(summaryElement.exists()).toBe(true);
        expect(summaryElement.text()).toBe(longSummary);
    });

    it('shows hover effects on history items', () => {
        const wrapper = mount(ReviewHistory, {
            props: {
                history: [mockHistory[0]],
                loading: false
            }
        });

        const item = wrapper.find('button.w-full');
        expect(item.classes()).toContain('hover:border-slate-700');
        expect(item.classes()).toContain('hover:bg-slate-800');
    });
});
