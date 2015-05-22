# Changelog


## v3.3.3 - 2015-05-22

### Changed

- update to [jQuery 1.11.3](http://blog.jquery.com/2015/04/28/jquery-1-11-3-and-2-1-4-released-ios-fail-safe-edition/)
  from 1.9.1 for fixes and improvements

- BIC-143: make the forms Save draft button directly visible, not in a pop-up


### Fixed

- BIC-144: when the current form has validation errors, prevent submissions

    - saves a draft with the current record data will instead

- BIC-148: clean up console errors triggered when switching browser tabs


## v3.3.2 - 2015-05-11

### Changed

- update to Forms v3.3.1


## v3.3.1 - 2015-05-06

### Changed

- update to Forms v3.3.0 and drop blobUploader functionality


## v3.3.0 - 2015-05-06

### Changed

- BIC-129: use If-Modified-Since HTTP header when requesting server-side
  Data Suitcases, instead of using a query string argument

    - improves compatibility with our upcoming Windows native app

- BIC-147: disable pending queue and all related behaviour when no persistent
  storage mechanism is available

    - see https://github.com/blinkmobile/bic-v3/pull/3 for details

    - `BMP.BIC.pending` is not available in this situtation

    - form submissions bypass the queue and go directly to the server

### Fixed

- BIC-142: improve URL routing when running from file:///, etc

    - improves compatibility with our upcoming Windows native app

    - includes slight streamlining of boot sequence so that Data Suitcases and
      Forms Definitions do not block the boot process


## v3.2.4 - 2015-04-13

### Changed

- update to Forms v3.2.1 and activate the blobUploader


## v3.2.3 - 2015-04-13

### Fixed

- BIC-140: switching tabs away from a form should no longer cause a reload


## v3.2.2 - 2015-03-31

### Changed

- update to Forms v3.2.0


## v3.2.1 - 2015-03-31

### Fixed

- BIC-136: behave offline-first when native plugin is available

    - corrects issue where non-offline-first native app shell broke
