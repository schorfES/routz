import { define, Routes } from './routz';


describe('Routes', () => {

	describe('define', () => {

		it('should expose api', () => {
			const api = define({
				'home': '/home',
			});

			expect(api)
				.toEqual({
					receive: expect.any(Function),
					resolve: expect.any(Function),
				});
		});

	});

	describe('receive', () => {

		it('should receive a route defintion by name', () => {
			const { receive } = define({
				'home': '/home',
				'comments': '/pages/[pageSlug]/comments/[commentSlug?]',
			});

			expect(receive('home'))
				.toBe('/home');
			expect(receive('comments'))
				.toBe('/pages/[pageSlug]/comments/[commentSlug?]');
		});

		it('should throw an error when route is not defined', () => {
			const { receive } = define({
				'home': '/home',
			});

			expect(() => receive('not-existing'))
				.toThrow(new Error('Can not find route by name "not-existing".'));
		});

		it('should allow to manipulate routes via object reference', () => {
			const routes: Routes = {
				'pages': '/pages',
			};

			const { receive } = define(routes);

			expect(receive('pages'))
				.toBe('/pages');
			expect(() => receive('not-defined'))
				.toThrow(new Error('Can not find route by name "not-defined".'));

			routes['pages'] = '/pages/list';
			routes['not-defined'] = '/but/defined/yet';

			expect(receive('pages'))
				.toBe('/pages/list');
			expect(receive('not-defined'))
				.toBe('/but/defined/yet');
		});

	});

	describe('resolve', () => {

		it('should resolve path', () => {
			const { resolve } = define({
				'home': '/home',
				'pages': '/pages',
				'comments': '/comments',
			});

			expect(resolve('home'))
				.toBe('/home');
			expect(resolve('pages', null))
				.toBe('/pages');
			expect(resolve('comments', {}))
				.toBe('/comments');
		});

		it('should resolve path with params', () => {
			const { resolve } = define({
				'pages': '/pages/[pageSlug]'
			});

			expect(resolve('pages', { pageSlug: 'foo' }))
				.toBe('/pages/foo');
		});

		it('should resolve path with combined params', () => {
			const { resolve } = define({
				'profile': '/profile/id-[id]-user'
			});

			expect(resolve('profile', { id: 'foo' }))
				.toBe('/profile/id-foo-user');
		});

		it('should resolve path with optional params', () => {
			const { resolve } = define({
				'pages:index': '/[locale?]/pages',
				'pages:index:filter': '/[locale?]/pages/filter/[filter?]',
				'pages:detail': '/pages/[slug]/[comment?]',
			});

			expect(resolve('pages:index'))
				.toBe('/pages');
			expect(resolve('pages:index', { locale: 'en' }))
				.toBe('/en/pages');
			expect(resolve('pages:index:filter', { locale: 'en' }))
				.toBe('/en/pages/filter');
			expect(resolve('pages:index:filter', { locale: 'en', filter: 'articles' }))
				.toBe('/en/pages/filter/articles');
			expect(resolve('pages:index:filter', { filter: 'articles' }))
				.toBe('/pages/filter/articles');
			expect(resolve('pages:detail', { slug: 'article-42' }))
				.toBe('/pages/article-42');
			expect(resolve('pages:detail', { slug: 'article-42', comment: 'comment-0815' }))
				.toBe('/pages/article-42/comment-0815');
		});

		it('should resolve sanitized paths', () => {
			const { resolve } = define({
				'pages:noslash': '/pages/[locale?]/[slug?]/[comment?]',
				'pages:slash': '/pages/[locale?]/[slug?]/[comment?]/',
			});

			expect(resolve('pages:noslash', {}))
				.toBe('/pages')
			expect(resolve('pages:noslash', { slug: 'article-42' }))
				.toBe('/pages/article-42')
			expect(resolve('pages:noslash', { slug: 'article-42', comment: 'comment-0815' }))
				.toBe('/pages/article-42/comment-0815')
			expect(resolve('pages:noslash', { locale: 'de', slug: 'article-42', comment: 'comment-0815' }))
				.toBe('/pages/de/article-42/comment-0815')

			expect(resolve('pages:slash', {}))
				.toBe('/pages/')
			expect(resolve('pages:slash', { slug: 'article-42' }))
				.toBe('/pages/article-42/')
			expect(resolve('pages:slash', { slug: 'article-42', comment: 'comment-0815' }))
				.toBe('/pages/article-42/comment-0815/')
			expect(resolve('pages:slash', { locale: 'de', slug: 'article-42', comment: 'comment-0815' }))
				.toBe('/pages/de/article-42/comment-0815/')
		});

		it('should throw an error when route is not defined', () => {
			const { resolve } = define({
				'home': '/home',
			});

			expect(() => resolve('not-existing', null))
				.toThrow(new Error('Can not find route by name "not-existing".'));
			expect(() => resolve('not-existing', { noSlug: 'bar' }))
				.toThrow(new Error('Can not find route by name "not-existing".'));
		});

		it('should throw an error when a required param is not passed', () => {
			const { resolve } = define({
				'pages:detail': '/pages/[slug]',
			});

			expect(() => resolve('pages:detail', null))
				.toThrow(new Error('Missing param "slug" for route "pages:detail".'));
			expect(() => resolve('pages:detail', { siteSlug: 'foo' }))
				.toThrow(new Error('Missing param "slug" for route "pages:detail".'));
		});

		it('should allow to manipulate routes via object reference', () => {
			const routes: Routes = {
				'pages:detail': '/pages/[slug]',
			};

			const { resolve } = define(routes);

			expect(resolve('pages:detail', { slug: 'article-42' }))
				.toBe('/pages/article-42');
			expect(() => resolve('not-defined'))
				.toThrow(new Error('Can not find route by name "not-defined".'));

			routes['pages:detail'] = '/pages/articles/[pageSlug]';
			routes['not-defined'] = '/but/[slug]/yet';

			expect(resolve('pages:detail', { pageSlug: 'article-7411' }))
				.toBe('/pages/articles/article-7411');
			expect(resolve('not-defined', { slug: 'defined' }))
				.toBe('/but/defined/yet');
		});

	});

});
