import { forwardRef } from 'react';

import { getUpperCaseStartedWord } from '../../utils/functions';
import styles from './Input.module.css';

const Input = forwardRef(
  (
    {
      name = '',
      type = 'text',
      label = '',
      placeholder = '',
      error = '',
      useLabel = true,
      containerClass = '',
      ...props
    },
    ref,
  ) => {
    const labelName = label || getUpperCaseStartedWord(name);
    const isCheckboxOrRadio = type === 'checkbox' || type === 'radio';

    return (
      <div
        className={`${containerClass} ${isCheckboxOrRadio ? styles.checkboxContainer : styles.inputContainer}`}
      >
        {!isCheckboxOrRadio && useLabel && (
          <label htmlFor={name} className={styles.label}>
            {labelName}
          </label>
        )}

        <input
          ref={ref}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder || getUpperCaseStartedWord(name)}
          className={`${styles.input} ${error ? styles.error : ''} ${isCheckboxOrRadio ? styles.checkbox : ''} ${props.disabled ? styles.disabled : ''}`}
          {...props}
        />
        {!isCheckboxOrRadio && error && <span className={styles.errorText}>{error}</span>}

        {isCheckboxOrRadio && (
          <div className={styles.checkboxLabelContainer}>
            <label htmlFor={name} className={styles.checkboxLabel}>
              {labelName}
            </label>
            {error && <span className={styles.errorText}>{` (${error})`}</span>}
          </div>
        )}
      </div>
    );
  },
);

export default Input;
