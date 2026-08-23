import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ReportModal from '../src/components/ReportModal';

describe('ReportModal', () => {
  it('renders correctly with reporting categories when visible is true', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ReportModal
          visible={true}
          targetType="Post"
          targetId="post_123"
          targetAuthorName="Jane Doe"
          targetContentSnippet="Sample content here"
          onClose={() => {}}
        />
      );
    });

    const root = renderer!.root;
    expect(root).toBeTruthy();
    
    // Check that title contains 'Report Post'
    const texts = root.findAllByType('Text' as any).map(t => t.props.children);
    const joinedText = JSON.stringify(texts);
    expect(joinedText).toContain('Report Post');
    expect(joinedText).toContain('Harassment or Bullying');
    expect(joinedText).toContain('Self-Harm or Suicide Concern');
  });

  it('does not render content when visible is false', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ReportModal
          visible={false}
          targetType="Comment"
          targetId="comment_456"
          onClose={() => {}}
        />
      );
    });

    expect(renderer!.toJSON()).toBeNull();
  });
});
