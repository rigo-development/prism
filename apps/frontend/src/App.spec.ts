import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import * as client from './api/client';

// Mock the API client
vi.mock('./api/client', () => ({
    analyzeCode: vi.fn(),
    fetchModels: vi.fn(),
    fetchHistory: vi.fn(),
    clearHistory: vi.fn(),
}));

describe('App.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (client.fetchModels as any).mockResolvedValue(['gemini-1.5-flash', 'gemini-1.5-pro']);
        (client.fetchHistory as any).mockResolvedValue([]);
    });

    it('renders the app with header and main sections', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('header').exists()).toBe(true);
        expect(wrapper.find('main').exists()).toBe(true);
        expect(wrapper.text()).toContain('Prism');
    });

    it('loads models on mount', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(client.fetchModels).toHaveBeenCalled();
    });

    it('loads history on mount', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(client.fetchHistory).toHaveBeenCalled();
    });

    it('displays model selector with loaded models', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        const select = wrapper.find('select');
        expect(select.exists()).toBe(true);

        const options = select.findAll('option');
        expect(options.length).toBe(2);
        expect(options[0].text()).toBe('gemini-1.5-flash');
        expect(options[1].text()).toBe('gemini-1.5-pro');
    });

    it('displays review mode selector with all three modes', () => {
        const wrapper = mount(App);

        const buttons = wrapper.findAll('button').filter(btn =>
            btn.text() === 'Security' || btn.text() === 'Performance' || btn.text() === 'Readability'
        );

        expect(buttons.length).toBe(3);
    });

    it('changes focus mode when clicking mode buttons', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const performanceBtn = wrapper.findAll('button').find(btn => btn.text() === 'Performance');
        expect(performanceBtn).toBeDefined();

        await performanceBtn!.trigger('click');
        await wrapper.vm.$nextTick();

        // Check if the button has the active class
        expect(performanceBtn!.classes()).toContain('bg-slate-700');
    });

    it('toggles history panel when clicking history button', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        // History should be visible by default
        expect(wrapper.find('.w-72').exists()).toBe(true);

        // Find the history toggle button (emoji 🕒)
        const historyBtn = wrapper.findAll('button').find(btn => btn.text().includes('🕒'));
        expect(historyBtn).toBeDefined();

        await historyBtn!.trigger('click');
        await wrapper.vm.$nextTick();

        // History should be hidden
        expect(wrapper.find('.w-72').exists()).toBe(false);
    });

    it('calls analyzeCode when clicking Run Analysis button', async () => {
        (client.analyzeCode as any).mockResolvedValue({
            summary: 'Code looks good',
            score: 85,
            issues: [],
            detectedLanguage: 'javascript',
            reviewId: '123'
        });

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const analyzeBtn = wrapper.findAll('button').find(btn =>
            btn.text().includes('Run Analysis')
        );
        expect(analyzeBtn).toBeDefined();

        await analyzeBtn!.trigger('click');
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(client.analyzeCode).toHaveBeenCalled();
    });

    it('displays loading state during analysis', async () => {
        (client.analyzeCode as any).mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({
                summary: 'Test',
                score: 90,
                issues: []
            }), 100))
        );

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const analyzeBtn = wrapper.findAll('button').find(btn =>
            btn.text().includes('Run Analysis')
        );

        await analyzeBtn!.trigger('click');
        await wrapper.vm.$nextTick();

        expect(analyzeBtn!.text()).toContain('Analyzing...');
        expect(analyzeBtn!.attributes('disabled')).toBeDefined();
    });

    it('refreshes history after successful analysis', async () => {
        (client.analyzeCode as any).mockResolvedValue({
            summary: 'Good code',
            score: 90,
            issues: [],
            reviewId: '456'
        });

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        vi.clearAllMocks();

        const analyzeBtn = wrapper.findAll('button').find(btn =>
            btn.text().includes('Run Analysis')
        );

        await analyzeBtn!.trigger('click');
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        // Should call fetchHistory again after analysis
        expect(client.fetchHistory).toHaveBeenCalled();
    });

    it('handles history item selection', async () => {
        const mockHistory = [{
            id: '1',
            code: 'test code',
            language: 'python',
            focus: 'security',
            summary: 'Test summary',
            score: 75,
            createdAt: new Date().toISOString(),
            issues: []
        }];

        (client.fetchHistory as any).mockResolvedValue(mockHistory);

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        // Simulate history selection
        const historyComponent = wrapper.findComponent({ name: 'ReviewHistory' });
        expect(historyComponent.exists()).toBe(true);

        historyComponent.vm.$emit('select', mockHistory[0]);
        await wrapper.vm.$nextTick();

        // Should show "Re-run Analysis" button in history mode
        const analyzeBtn = wrapper.findAll('button').find(btn =>
            btn.text().includes('Re-run Analysis')
        );
        expect(analyzeBtn).toBeDefined();
    });

    it('shows New Analysis button in history mode', async () => {
        const mockHistory = [{
            id: '1',
            code: 'test code',
            language: 'python',
            focus: 'security',
            summary: 'Test summary',
            score: 75,
            createdAt: new Date().toISOString()
        }];

        (client.fetchHistory as any).mockResolvedValue(mockHistory);

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        const historyComponent = wrapper.findComponent({ name: 'ReviewHistory' });
        historyComponent.vm.$emit('select', mockHistory[0]);
        await wrapper.vm.$nextTick();

        const newAnalysisBtn = wrapper.findAll('button').find(btn =>
            btn.text() === 'New Analysis'
        );
        expect(newAnalysisBtn).toBeDefined();
    });

    it('clears history when clear button is clicked', async () => {
        (client.clearHistory as any).mockResolvedValue(undefined);

        // Mock window.confirm
        global.confirm = vi.fn(() => true);

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const historyComponent = wrapper.findComponent({ name: 'ReviewHistory' });
        historyComponent.vm.$emit('clear');
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(client.clearHistory).toHaveBeenCalled();
    });

    it('does not clear history when user cancels confirmation', async () => {
        global.confirm = vi.fn(() => false);

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const historyComponent = wrapper.findComponent({ name: 'ReviewHistory' });
        historyComponent.vm.$emit('clear');
        await wrapper.vm.$nextTick();

        expect(client.clearHistory).not.toHaveBeenCalled();
    });

    it('passes correct props to CodeEditor component', async () => {
        const wrapper = mount(App);
        await wrapper.vm.$nextTick();

        const codeEditor = wrapper.findComponent({ name: 'CodeEditor' });
        expect(codeEditor.exists()).toBe(true);
        expect(codeEditor.props('readonly')).toBe(false);
    });

    it('sets CodeEditor to readonly in history mode', async () => {
        const mockHistory = [{
            id: '1',
            code: 'test code',
            language: 'python',
            focus: 'security',
            summary: 'Test summary',
            score: 75,
            createdAt: new Date().toISOString()
        }];

        (client.fetchHistory as any).mockResolvedValue(mockHistory);

        const wrapper = mount(App);
        await wrapper.vm.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 10));

        const historyComponent = wrapper.findComponent({ name: 'ReviewHistory' });
        historyComponent.vm.$emit('select', mockHistory[0]);
        await wrapper.vm.$nextTick();

        const codeEditor = wrapper.findComponent({ name: 'CodeEditor' });
        expect(codeEditor.props('readonly')).toBe(true);
    });
});
