.PHONY: preview build test dev

preview:
	@npm run build
	@echo "" 
	@echo "  Preview: http://$(shell hostname -I | awk '{print $$1}'):4321"
	@echo ""
	npx astro preview --host 0.0.0.0 --port 4321
